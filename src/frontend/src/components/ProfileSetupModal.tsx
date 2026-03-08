import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveUserProfile } from "../hooks/useQueries";

export default function ProfileSetupModal() {
  const [name, setName] = useState("");
  const saveProfile = useSaveUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile.mutateAsync({ name: name.trim() });
      toast.success(`Welcome to BookLo, ${name.trim()}!`);
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-md" data-ocid="profile.dialog">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-2xl gradient-amber flex items-center justify-center shadow-amber">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl">
                Welcome to BookLo!
              </DialogTitle>
              <DialogDescription>
                Tell us your name to get started
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              data-ocid="profile.input"
            />
          </div>
          <Button
            type="submit"
            className="w-full gradient-amber border-0 text-primary-foreground shadow-amber font-semibold"
            disabled={!name.trim() || saveProfile.isPending}
            data-ocid="profile.submit_button"
          >
            {saveProfile.isPending ? "Saving..." : "Let's Go! 🚀"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
