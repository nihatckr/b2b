import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";

interface AlertButtonProps {
  resendVerificationEmail: () => void;
  isResendingEmail: boolean;
  description: string;
  label: string;
  buttonTextResending: string;
  buttonTextDefault: string;
  icon: React.ReactNode;
}

const AlertButton = ({
  resendVerificationEmail,
  isResendingEmail,
  description,
  label,
  buttonTextResending,
  buttonTextDefault,
  icon,
}: AlertButtonProps) => {
  return (
    <Alert variant="destructive" className="border-red-200 dark:border-red-900">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{label}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{description}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={resendVerificationEmail}
          disabled={isResendingEmail}
          className="ml-4 whitespace-nowrap"
        >
          {icon}
          {isResendingEmail ? buttonTextResending : buttonTextDefault}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default AlertButton;
