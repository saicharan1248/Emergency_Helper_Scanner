// FIX: The Label component requires LabelHTMLAttributes for the `htmlFor` prop.
import React, { createContext, useContext, useState, useCallback, ReactNode, forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, HTMLAttributes, LabelHTMLAttributes, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { HeartPulse, X } from 'lucide-react';

// Toast System
interface ToastMessage {
  id: number;
  title: string;
  description: string;
  variant: 'default' | 'destructive';
}
interface ToastContextType {
  toast: (options: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((options: Omit<ToastMessage, 'id'>) => {
    const newToast = { ...options, id: Date.now() };
    setToasts(currentToasts => [newToast, ...currentToasts]);
    setTimeout(() => {
      setToasts(currentToasts => currentToasts.filter(t => t.id !== newToast.id));
    }, 5000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(currentToasts => currentToasts.filter(t => t.id !== id));
  };
  
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-0 right-0 p-4 z-50 w-full max-w-sm">
        <div className="space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={cn(
            "relative w-full rounded-lg border p-4 shadow-lg",
            t.variant === 'destructive' ? "bg-destructive text-destructive-foreground" : "bg-background border"
          )}>
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <p className="font-semibold">{t.title}</p>
                <p className="text-sm opacity-90">{t.description}</p>
              </div>
              <button onClick={() => removeToast(t.id)} className="absolute top-2 right-2 p-1 rounded-md opacity-70 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
};

// Button
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
// FIX: The `asChild` prop renders a `div`, but the props are typed for a `button`.
// This causes a type mismatch. Casting props to `any` is a pragmatic solution
// to resolve the type error without a major refactor.
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  if (asChild) {
    return <div className={cn(buttonVariants({ variant, size, className }))} {...(props as any)} />;
  }
  return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';
export { Button, buttonVariants };

// Input
const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => {
  return <input type={type} className={cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className)} ref={ref} {...props} />;
});
Input.displayName = 'Input';
export { Input };

// Label
// FIX: The props type was changed from `HTMLAttributes` to `LabelHTMLAttributes` to correctly include the `htmlFor` property.
const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)} {...props} />
));
Label.displayName = 'Label';
export { Label };

// Textarea
const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => {
  return <textarea className={cn('flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className)} ref={ref} {...props} />;
});
Textarea.displayName = 'Textarea';
export { Textarea };

// Badge
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
      },
    },
    defaultVariants: { variant: 'secondary' },
  }
);
// FIX: The Badge component was defined as a plain function, which caused TypeScript typing issues.
// Converted to a forwardRef component to align with other components in the file, ensuring it's
// correctly typed as a React component and resolving errors with `key`, `className`, and `variant` props.
export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
const Badge = forwardRef<HTMLDivElement, BadgeProps>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(badgeVariants({ variant, className }))} {...props} />
));
Badge.displayName = 'Badge';

export { Badge };

// Card
const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)} {...props} />);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(({ className, ...props }, ref) => <h3 ref={ref} className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />);
CardFooter.displayName = 'CardFooter';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };


// Cursor/Tap Animation Component
const CursorTrail: React.FC = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [taps, setTaps] = useState<{ id: number; x: number; y: number }[]>([]);
    
    const trailRefs = useRef<React.RefObject<HTMLDivElement>[]>(
        Array.from({ length: 10 }, () => React.createRef())
    );

    useEffect(() => {
        const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        if (window.innerWidth >= 768) {
            const handleMouseMove = (e: MouseEvent) => {
                trailRefs.current.forEach((ref) => {
                    if (ref.current) {
                        ref.current.style.left = `${e.clientX}px`;
                        ref.current.style.top = `${e.clientY}px`;
                    }
                });
            };
            window.addEventListener('mousemove', handleMouseMove);
            return () => {
                window.removeEventListener('resize', checkIsMobile);
                window.removeEventListener('mousemove', handleMouseMove);
            };
        } else {
            const handleTouch = (e: TouchEvent) => {
                const touch = e.touches[0];
                const newTap = { id: Date.now(), x: touch.clientX, y: touch.clientY };
                setTaps(prev => [...prev, newTap]);
                setTimeout(() => {
                    setTaps(prev => prev.filter(t => t.id !== newTap.id));
                }, 1000);
            };
            window.addEventListener('touchstart', handleTouch);
            return () => {
                 window.removeEventListener('resize', checkIsMobile);
                 window.removeEventListener('touchstart', handleTouch);
            }
        }
    }, []);

    if (isMobile) {
        return (
            <>
                {taps.map(tap => (
                    <div
                        key={tap.id}
                        className="fixed pointer-events-none z-[9999] rounded-full bg-primary animate-tap-burst"
                        style={{
                            left: tap.x,
                            top: tap.y,
                            width: '50px',
                            height: '50px',
                        }}
                    />
                ))}
            </>
        );
    }

    return (
        <>
            {trailRefs.current.map((ref, i) => (
                <div
                    key={i}
                    ref={ref}
                    className="fixed rounded-full pointer-events-none z-[9999] bg-primary/80"
                    style={{
                        width: `${15 - i}px`,
                        height: `${15 - i}px`,
                        transform: 'translate(-50%, -50%)',
                        transition: 'all 200ms ease-out',
                        transitionDelay: `${i * 20}ms`,
                        opacity: `${1 - i / 10}`,
                    }}
                />
            ))}
        </>
    );
};


// Layout Components
export const Header: React.FC = () => (
  <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container flex h-14 items-center">
      <Link to="/" className="mr-6 flex items-center space-x-2">
        <HeartPulse className="h-6 w-6" />
        <span className="font-bold">EAN</span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <NavLink to="/register" className={({isActive}) => cn("transition-colors hover:text-foreground/80", isActive ? "text-foreground" : "text-foreground/60")}>Register</NavLink>
        <NavLink to="/scan" className={({isActive}) => cn("transition-colors hover:text-foreground/80", isActive ? "text-foreground" : "text-foreground/60")}>Scan</NavLink>
      </nav>
    </div>
  </header>
);

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <CursorTrail />
    <Header />
    {children}
    <footer className="py-6 md:px-8 md:py-0 bg-secondary">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                Built for demonstration purposes. Not for real emergencies.
            </p>
        </div>
    </footer>
  </div>
);