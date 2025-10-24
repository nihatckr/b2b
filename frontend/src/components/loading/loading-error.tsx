import { Card, CardContent } from "../ui/card";

interface LoadingErrorProps {
  message: string;
  errorTitle: string;
}

const LoadingError = ({ message, errorTitle }: LoadingErrorProps) => {
  return (
    <div className="p-6">
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">
            {errorTitle}
          </h3>
          <p className="text-gray-600">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingError;
