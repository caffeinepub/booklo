import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../App";

const ADMIN_PASSWORD = "Naitik20510";

export default function AdminLoginPage() {
  const { navigate, setAdminToken } = useApp();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    if (password === ADMIN_PASSWORD) {
      setAdminToken(password);
      toast.success("Welcome, Admin!");
      navigate("admin-dashboard");
    } else {
      toast.error("Incorrect password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <Card
        className="w-full max-w-md shadow-card"
        data-ocid="admin-login.panel"
      >
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="font-display text-2xl">Admin Login</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your admin password to continue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                data-ocid="admin-login.input"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            <Button
              data-ocid="admin-login.submit_button"
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
            <Button
              data-ocid="admin-login.cancel_button"
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate("home")}
            >
              Back to Home
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
