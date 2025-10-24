import { Factory } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";

interface AlertLinkProps {
  linkLabel: string;
  description: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const AlertLink = ({
  description,
  label,
  linkLabel,
  icon,
  href,
}: AlertLinkProps) => {
  return (
    <Alert
      variant="default"
      className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950"
    >
      <Factory className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-900 dark:text-orange-100">
        {label}
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between text-orange-800 dark:text-orange-200">
        <span>{description}</span>
        <Link href={href}>
          <Button
            variant="outline"
            size="sm"
            className="ml-4 whitespace-nowrap border-orange-300 hover:bg-orange-100 dark:border-orange-700 dark:hover:bg-orange-900"
          >
            {icon}
            {linkLabel}
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
};

export default AlertLink;
