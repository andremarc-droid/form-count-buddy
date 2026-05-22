import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { doc, deleteDoc } from "firebase/firestore";
import { dictDb } from "@/lib/firebase-dict";
import { toast } from "sonner";
import { AttendanceRecord } from "@/types/attendance";

interface DictDeleteAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: AttendanceRecord | null;
}

export function DictDeleteAttendanceDialog({
  open,
  onOpenChange,
  record,
}: DictDeleteAttendanceDialogProps) {
  const handleDelete = async () => {
    if (!record) return;
    try {
      await deleteDoc(doc(dictDb, "dict_attendance", record.id));
      toast.success("Attendance record deleted successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record. Please try again.");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Attendance Record?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the attendance record for{" "}
            <span className="font-semibold text-foreground">
              {record?.fullName}
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
