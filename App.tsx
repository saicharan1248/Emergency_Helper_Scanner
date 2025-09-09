

import React, { useState } from 'react';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { Layout, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Input, Label, Textarea, Badge, useToast } from './components/ui';
import { QRCodeGenerator, QRScanner } from './components/QRCodeComponents';
import { useUsers } from './context/UserContext';
import { User } from './types';
import { ShieldCheck, HeartPulse, UserPlus, QrCode, ArrowLeft, Share2, Download, Copy } from 'lucide-react';

// Page Components defined in the same file for consolidation

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <div className="flex items-center text-primary mb-4">
        <HeartPulse size={48} className="mr-3 animate-heart-pulse" />
        <h1 className="text-4xl md:text-5xl font-bold">Emergency Assistance Network</h1>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
        Connecting skilled professionals with those in need during critical moments. Register as a helper or scan a QR code to find assistance nearby.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link to="/register">
            <UserPlus className="mr-2 h-5 w-5" /> Register as a Helper
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
          <Link to="/scan">
            <QrCode className="mr-2 h-5 w-5" /> Scan for a Helper
          </Link>
        </Button>
      </div>
    </div>
  );
};

const RegisterPage: React.FC = () => {
  const { addUser } = useUsers();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', profession: '', organization: '', skills: '', experience: '', bio: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.profession || !formData.skills) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    const newUser = addUser({ ...formData, experience: Number(formData.experience) || 0 });
    // FIX: The toast function requires a `variant` property. Added `variant: 'default'` for the success message.
    toast({ title: "Success!", description: "You have been registered as a helper.", variant: 'default' });
    navigate(`/profile/${newUser.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Register as a Helper</CardTitle>
          <CardDescription>Fill out your professional details to generate your assistance QR code. Fields with * are required.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" name="name" onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="profession">Profession *</Label>
                <Input id="profession" name="profession" onChange={handleChange} placeholder="e.g., Doctor, Electrician" required />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" name="email" type="email" onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" name="phone" type="tel" onChange={handleChange} required />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="organization">Organization (Optional)</Label>
                <Input id="organization" name="organization" onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="experience">Years of Experience (Optional)</Label>
                <Input id="experience" name="experience" type="number" onChange={handleChange} />
              </div>
            </div>
            <div>
              <Label htmlFor="skills">Skills *</Label>
              <Textarea id="skills" name="skills" placeholder="e.g., First Aid, CPR, Electrical Wiring..." onChange={handleChange} required />
              <p className="text-sm text-muted-foreground mt-1">Separate skills with commas.</p>
            </div>
            <div>
              <Label htmlFor="bio">Short Bio (Optional)</Label>
              <Textarea id="bio" name="bio" placeholder="A brief summary of your expertise." onChange={handleChange} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Generate My QR Code</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

const ScanPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleScanSuccess = (decodedText: string) => {
    // FIX: The toast function requires a `variant` property. Added `variant: 'default'` for the success message.
    toast({ title: "QR Code Scanned!", description: "Loading helper profile...", variant: 'default' });
    navigate(`/profile/${decodedText}`);
  };

  const handleError = (error: string) => {
    toast({ title: "Scan Error", description: error, variant: "destructive" });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Scan for a Helper</CardTitle>
          <CardDescription>Point your camera at an Emergency Assistance QR code to view the helper's profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <QRScanner onScanSuccess={handleScanSuccess} onError={handleError} />
        </CardContent>
      </Card>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getUserById } = useUsers();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);

  React.useEffect(() => {
    if (id) {
      const foundUser = getUserById(id);
      setUser(foundUser || null);
    }
  }, [id, getUserById]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Emergency Assistance Helper Profile',
          text: `View the profile of ${user?.profession}`,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        // FIX: The toast function requires a `variant` property. Added `variant: 'default'` for the success message.
        toast({ title: 'Copied to Clipboard', description: 'Profile link copied.', variant: 'default' });
      }
    } catch (error) {
      console.error('Share failed:', error);
      await navigator.clipboard.writeText(url);
      // FIX: The toast function requires a `variant` property. Added `variant: 'default'` for the success message.
      toast({ title: 'Copied to Clipboard', description: 'Sharing failed, link copied instead.', variant: 'default' });
    }
  };

  if (!user) {
    return (
        <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Profile Not Found</h2>
            <p className="text-muted-foreground mb-6">The helper profile you are looking for does not exist.</p>
            <Button onClick={() => navigate('/')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Home
            </Button>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back
        </Button>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 flex flex-col items-center">
          <Card className="w-full">
            <CardHeader className="items-center text-center">
              <CardTitle className="text-xl">Helper QR Code</CardTitle>
              <CardDescription>Scan to view this profile</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <QRCodeGenerator value={user.id} />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl">{user.profession}</CardTitle>
                    <CardDescription>
                      {user.organization ? `${user.organization} | ` : ''} 
                      {user.experience ? `${user.experience} years experience` : 'Experienced Professional'}
                    </CardDescription>
                  </div>
                  <ShieldCheck className="h-10 w-10 text-primary"/>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <p className="text-muted-foreground"><strong>Email:</strong> {user.email}</p>
                <p className="text-muted-foreground"><strong>Phone:</strong> {user.phone}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {/* FIX: The `key` prop for a mapped component should be unique. Using the index from the map function is a reliable way to ensure this. */}
                  {user.skills.split(',').map((skill, index) => (
                    <Badge key={index}>{skill.trim()}</Badge>
                  ))}
                </div>
              </div>
              {user.bio && (
                <div>
                  <h3 className="font-semibold mb-2">Bio</h3>
                  <p className="text-muted-foreground">{user.bio}</p>
                </div>
              )}
               <div>
                <h3 className="font-semibold mb-2">Registered On</h3>
                <p className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
                 <Button onClick={handleShare} className="w-full"><Share2 className="mr-2 h-4 w-4"/> Share Profile</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};


function App() {
  return (
    <Layout>
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
    </Layout>
  );
}

export default App;