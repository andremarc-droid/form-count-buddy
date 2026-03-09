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
import { type VisitorRow, useDeleteVisitor } from "@/hooks/useVisitorData";
import { toast } from "sonner";

interface DeleteVisitorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    visitor: VisitorRow | null;
}

export function DeleteVisitorDialog({
    open,
    onOpenChange,
    visitor,
}: DeleteVisitorDialogProps) {
    const deleteMutation = useDeleteVisitor();

    const handleDelete = async () => {
        if (!visitor) return;
        try {
            await deleteMutation.mutateAsync(visitor.id);
            toast.success(`"${visitor.full_name}" has been deleted`);
            onOpenChange(false);
        } catch (error) {
            console.error("Error deleting visitor:", error);
            toast.error("Failed to delete visitor. Please try again.");
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Visitor</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-foreground">
                            {visitor?.full_name}
                        </span>
                        ? This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
