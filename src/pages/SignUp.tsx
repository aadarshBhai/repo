import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/api";

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validatePassword = (p: string): string | null => {
    const meetsLength = p.length >= 8;
    const hasUpper = /[A-Z]/.test(p);
    const hasLower = /[a-z]/.test(p);
    const hasSpecial = /[^A-Za-z0-9]/.test(p);
    if (!meetsLength || !hasUpper || !hasLower || !hasSpecial) {
      return "Password must be at least 8 characters and include uppercase, lowercase, and a special character.";
    }
    return null;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPasswordError(null);
    
    const err = validatePassword(password);
    if (err) {
      setPasswordError(err);
      setLoading(false);
      return;
    }

    try {
      // Call the actual signup API using authFetch
      const response = await authFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.errors?.[0]?.msg || 'Registration failed');
      }

      // If registration is successful, log the user in
      if (data.token) {
        login(data.token);
        // The login function will handle the redirect to /profile
      } else {
        // If no token is returned, redirect to login
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please log in.',
            email: email
          },
          replace: true 
        });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setPasswordError(error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary">Create your account</h1>
            <p className="mt-2 text-muted-foreground text-sm md:text-base">Sign up to contribute and manage your profile.</p>
          </div>

          <form onSubmit={onSubmit} className="rounded-xl border bg-card/80 backdrop-blur p-6 space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                  const err = validatePassword(val);
                  setPasswordError(err);
                }}
                required
                placeholder="••••••••"
                aria-invalid={!!passwordError}
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}"
                title="At least 8 characters, including uppercase, lowercase, and a special character"
              />
              {passwordError && (
                <p className="text-xs text-red-600">{passwordError}</p>
              )}
              {!passwordError && (
                <p className="text-xs text-muted-foreground">At least 8 characters, include uppercase, lowercase, and a special character.</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Sign Up'}
            </Button>
            <p className="text-xs text-muted-foreground text-center">By signing up, you agree to our consent-first community principles.</p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SignUp;
