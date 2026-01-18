/**
 * Login (/login): email/password sign-in and sign-up. Firebase Auth; on success navigate to /.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, AuthError } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InlineBanner } from "@/components/ui/InlineBanner";
import { Sparkles } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
      } else {
        // Sign in
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/");
    } catch (err: unknown) {
      let errorMessage = "Authentication failed";

      if (err instanceof Object && "code" in err) {
        const errorCode = (err as AuthError).code;
        if (errorCode === "auth/email-already-in-use") {
          errorMessage = "This email is already registered";
        } else if (errorCode === "auth/weak-password") {
          errorMessage = "Password should be at least 6 characters";
        } else if (errorCode === "auth/invalid-email") {
          errorMessage = "Please enter a valid email";
        } else if (errorCode === "auth/user-not-found") {
          errorMessage = "No account found with this email";
        } else if (errorCode === "auth/wrong-password") {
          errorMessage = "Incorrect password";
        } else {
          errorMessage = (err as AuthError).message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/30 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(34,197,94,0.05),transparent_50%)]" aria-hidden />
      <Card className="relative w-full max-w-md shadow-elevated border-2 border-border/60 backdrop-blur-sm">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2 justify-center mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center font-serif text-2xl">
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-center text-sm">
            {isSignUp
              ? "Join us and start tracking your daily reflections"
              : "Sign in to continue your journey"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <InlineBanner variant="error" title="Error" description={error} />
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Alex"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full font-medium"
              disabled={isLoading}
            >
              {isLoading
                ? "Loading..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground text-xs">
                {isSignUp ? "Already have an account?" : "New here?"}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setEmail("");
              setPassword("");
              setDisplayName("");
            }}
          >
            {isSignUp
              ? "Sign In Instead"
              : "Create New Account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
