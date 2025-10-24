import { Spinner } from "@/components/ui/spinner";

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner = ({ message }: LoadingSpinnerProps) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Spinner className="w-16 h-16 mx-auto mb-4" />
        {message && (
          <p className="text-slate-600 dark:text-slate-400">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
