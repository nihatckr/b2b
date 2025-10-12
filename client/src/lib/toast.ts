import { toast } from "sonner";

export function showToast(message: string, type: "success" | "error" | "info") {
  switch (type) {
    case "success":
      toast.success(message, {
        duration: 4000,
        position: "top-right",
      });
      break;
    case "error":
      toast.error(message, {
        duration: 4000,
        position: "top-right",
      });
      break;
    case "info":
      toast(message, {
        duration: 4000,
        position: "top-right",
      });
      break;
    default:
      toast(message, {
        duration: 4000,
        position: "top-right",
      });
      break;
  }
}
