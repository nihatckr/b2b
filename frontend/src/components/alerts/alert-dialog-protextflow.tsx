import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface AlertDialogProtexflowProps {
  deleteAlertOpen: boolean;
  setDeleteAlertOpen: (open: boolean) => void;
  loadingDelete: boolean;
  handleConfirmDelete: () => void;
  alertTitle?: string;
  alertDescription?: string;
  alertSubmitText?: string;
  alertSendText?: string;
  alertCancelText?: string;
  label?: string | null;
}

const AlertDialogProtexflow: React.FC<AlertDialogProtexflowProps> = ({
  deleteAlertOpen,
  setDeleteAlertOpen,
  label,
  loadingDelete,
  handleConfirmDelete,
  alertTitle,
  alertCancelText,
  alertSubmitText,
  alertSendText,
}) => {
  return (
    <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{alertTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {label}? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loadingDelete}>
            {alertCancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={loadingDelete}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loadingDelete ? `${alertSubmitText}` : `${alertSendText}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertDialogProtexflow;
