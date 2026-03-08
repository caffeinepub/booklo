import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../App";

const ADMIN_PASSWORD = "Naitik20510";

export default function AdminLoginModal() {
  const { adminLoginOpen, setAdminLoginOpen, setAdminUnlocked, navigate } =
    useApp();
  const [password, setPassword] = useState("");
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAdminUnlocked(true);
      setAdminLoginOpen(false);
      setPassword("");
      navigate("admin");
      toast.success("Welcome, Admin!", {
        description: "You now have full admin access.",
        icon: <ShieldCheck className="h-4 w-4 text-amber-600" />,
      });
    } else {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      toast.error("Incorrect password", {
        description: "Please check your admin password and try again.",
      });
      setPassword("");
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setPassword("");
    }
    setAdminLoginOpen(open);
  };

  return (
    <Dialog open={adminLoginOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm" data-ocid="admin_login.dialog">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl gradient-amber flex items-center justify-center shadow-amber flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="font-display font-bold text-xl leading-tight">
                Admin Access
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                Enter the admin password to continue
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className={`space-y-4 pt-2 ${shaking ? "animate-shake" : ""}`}
          style={
            shaking
              ? {
                  animation: "shake 0.4s ease-in-out",
                }
              : {}
          }
        >
          <div className="space-y-2">
            <Label
              htmlFor="admin-password"
              className="font-semibold flex items-center gap-2"
            >
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Admin Password
            </Label>
            <Input
              id="admin-password"
              type="password"
              placeholder="Enter admin password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              autoFocus
              className="rounded-xl"
              data-ocid="admin_login.password_input"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              data-ocid="admin_login.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gradient-amber border-0 text-primary-foreground shadow-amber font-semibold gap-2"
              disabled={!password.trim()}
              data-ocid="admin_login.submit_button"
            >
              <ShieldCheck className="h-4 w-4" />
              Access Admin Panel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
