// TODO: Replace these imports with actual DICT assets when available
import logo from "@/assets/DICT-Malaybalay.png";
import bgImage from "@/assets/DICTbg.jpg";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dictAuth } from "@/lib/firebase-dict";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const DictAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(dictAuth, email, password);
      navigate("/dict/admin/dashboard");
    } catch (error: any) {
      const code = error?.code;
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        toast.error("Invalid email or password.");
      } else if (code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm z-0"></div>
      <Card className="w-full max-w-md animate-fade-in relative z-10 bg-card/95 backdrop-blur-md border-border/50 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mx-auto mb-6">
            {/* TODO: Replace logo import at top of file with DICT logo */}
            <img src={logo} alt="DICT Logo" className="h-40 w-auto object-contain" />
          </div>
          <CardTitle className="font-heading text-2xl">Admin Login</CardTitle>
          <CardDescription>DICT Provincial Office Bukidnon</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dict_email">Email</Label>
              <Input id="dict_email" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dict_password">Password</Label>
              <Input id="dict_password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DictAdminLogin;
