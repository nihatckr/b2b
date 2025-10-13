"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { MultiStepSignupForm } from "../SignupForm/multi-step-signup-form";

interface SignupModalProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function SignupModal({ children, onSuccess }: SignupModalProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false); // Modal'ı kapat
    onSuccess?.(); // Callback çağır
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create your account</DialogTitle>
        </DialogHeader>
        <MultiStepSignupForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
