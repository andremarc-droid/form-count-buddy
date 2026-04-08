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
import { type DictVisitorRow, useDictDeleteVisitor } from "@/hooks/useDictVisitorData";
import { toast } from "sonner";

interface DictDeleteVisitorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    visitor: DictVisitorRow | null;
}

export function DictDeleteVisitorDialog({
    open,
    onOpenChange,
    visitor,
}: DictDeleteVisitorDialogProps) {
    const deleteMutation = useDictDeleteVisitor();

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
