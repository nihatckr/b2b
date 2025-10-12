import { useEffect, useRef } from "react";
import { Toaster } from "sonner";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useRef(null);
  useEffect(() => {
    if (toast.current) return;
  }, []);

  return (
    <>
      <Toaster />
      {children}
    </>
  );
}
