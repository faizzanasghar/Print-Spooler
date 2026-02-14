import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, User, Lock, UserPlus } from "lucide-react";
import generatedImage from '@assets/generated_images/abstract_digital_data_flow_background.png';
import logo from "@assets/logo.jpg";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");

  // Registration State
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/dashboard");
      toast({
        title: "Welcome back",
        description: "Successfully logged into PrintPilot System.",
      });
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername || !regPassword) {
        toast({
            title: "Error",
            description: "Please fill in all fields",
            variant: "destructive"
        });
        return;
    }

    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        toast({
            title: "Account Created",
            description: `User ${regUsername} registered successfully. Please login.`,
        });
        setActiveTab("login");
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={generatedImage} 
          alt="Background" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sidebar/80 via-sidebar/90 to-sidebar"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8 space-y-4 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl">
            <img src={logo} alt="FORT TECH" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">PrintPilot</h1>
            <p className="text-primary font-medium tracking-widest text-sm">FORT TECH</p>
          </div>
        </div>

        <Card className="border-border/50 shadow-xl backdrop-blur-md bg-card/95">
          <CardHeader>
            <CardTitle>System Access</CardTitle>
            <CardDescription>Authentication Required</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Username / ID</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="email" placeholder="admin" className="pl-9" defaultValue="admin" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input id="password" type="password" className="pl-9" placeholder="••••••••" defaultValue="password" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Authenticating..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                   <div className="space-y-2">
                    <Label htmlFor="reg-email">New Username</Label>
                    <div className="relative">
                        <UserPlus className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="reg-email" 
                            placeholder="jdoe" 
                            value={regUsername}
                            onChange={e => setRegUsername(e.target.value)}
                        />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-pass">Choose Password</Label>
                     <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="reg-pass" 
                            type="password" 
                            value={regPassword}
                            onChange={e => setRegPassword(e.target.value)}
                        />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" variant="secondary" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4 pb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-3 h-3" />
              <span>Secure System Access v2.0</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
