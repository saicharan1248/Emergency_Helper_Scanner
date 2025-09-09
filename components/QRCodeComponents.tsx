

import React, { useEffect, useRef, useState, useCallback } from "react";
import QRCode from "qrcode";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from './ui';
import { Camera, CameraOff, Download, ScanLine } from 'lucide-react';

// QRCodeGenerator Component
interface QRCodeGeneratorProps {
  value: string;
  size?: number;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ value, size = 256 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 2,
          color: { dark: "#3C071E", light: "#FFFFFF" }, // Using a dark foreground color from the theme
        },
        (error) => {
          if (error) console.error("Error generating QR code:", error);
        }
      );
    }
  }, [value, size]);

  const handleDownload = () => {
    if (canvasRef.current) {
        const url = canvasRef.current.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `emergency-assistance-qr-${value}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
    <div className="inline-block text-center">
      <canvas ref={canvasRef} className="rounded-lg" />
      <Button variant="outline" size="sm" className="mt-4" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4"/> Download
      </Button>
    </div>
  );
};

// QRScanner Component
interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onError: (error: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onError }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopScanning = useCallback(async () => {
    // Rely on the library's internal state check to prevent race conditions.
    if (scannerRef.current && scannerRef.current.isScanning) {
        try {
            await scannerRef.current.stop();
            setIsScanning(false);
        } catch (err) {
            // This error can happen if the component unmounts quickly.
            // Logging it is enough; no need to show a toast to the user.
            console.error("Error stopping scanner:", err);
        }
    }
  }, []);

  const startScanning = useCallback(async () => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText, _) => {
            // FIX: Stop the scanner *before* navigating to prevent a race condition.
            // The unhandled rejection occurs when the video element is removed
            // from the DOM before the camera stream is properly closed.
            stopScanning().then(() => {
                onScanSuccess(decodedText);
            });
          },
          (_) => { /* ignore */ }
        );
        setIsScanning(true);
        setCameraError(null);
      } else {
          const errorMessage = "No cameras found on this device.";
          setCameraError(errorMessage);
          onError(errorMessage);
      }
    } catch (err) {
      console.error("Camera error:", err);
      const errorMessage = "Failed to access camera. Please check permissions.";
      setCameraError(errorMessage);
      onError(errorMessage);
    }
  }, [onScanSuccess, onError, stopScanning]);

  useEffect(() => {
    // Cleanup function to ensure the scanner stops when the component unmounts.
    return () => {
        if(scannerRef.current?.isScanning){
            scannerRef.current.stop().catch(console.error);
        }
    };
  }, []);

  return (
    <div className="w-full text-center">
      <div id="qr-reader" className="w-full max-w-sm mx-auto aspect-square bg-secondary rounded-lg my-4 border-dashed border-2 border-muted-foreground/50 flex items-center justify-center overflow-hidden">
        {!isScanning && !cameraError && (
          <div className="text-muted-foreground flex flex-col items-center">
              <ScanLine size={48} className="text-primary/50"/>
              <p>Camera view will appear here</p>
          </div>
        )}
      </div>

      {cameraError && (
        <div className="text-destructive font-semibold p-4 bg-destructive/10 rounded-md flex items-center justify-center">
            <CameraOff className="mr-2 h-5 w-5"/> {cameraError}
        </div>
      )}

      <div className="mt-4 flex justify-center gap-4">
        {!isScanning ? (
          <Button onClick={startScanning} disabled={!!cameraError}>
            <Camera className="mr-2 h-4 w-4" /> Start Scan
          </Button>
        ) : (
          <Button onClick={stopScanning} variant="destructive">
            <CameraOff className="mr-2 h-4 w-4" /> Stop Scan
          </Button>
        )}
      </div>
    </div>
  );
};