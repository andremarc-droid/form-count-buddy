
import { DeleteVisitorDialog } from "@/components/DeleteVisitorDialog";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VisitorFormDialog } from "@/components/VisitorFormDialog";
import { formatLabel, useBulkDeleteVisitors, useVisitorData, type VisitorRow } from "@/hooks/useVisitorData";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const AdminVisitors = () => {
  const { data: visitors = [], isLoading } = useVisitorData();
  const [search, setSearch] = useState("");

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorRow | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const bulkDeleteMutation = useBulkDeleteVisitors();

  const filtered = visitors.filter((v) =>
    v.full_name.toLowerCase().includes(search.toLowerCase()) ||
    v.industry.toLowerCase().includes(search.toLowerCase()) ||
    v.purpose.toLowerCase().includes(search.toLowerCase())
  );

  const allFilteredSelected = filtered.length > 0 && filtered.every((v) => selectedIds.has(v.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((v) => v.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    try {
      await bulkDeleteMutation.mutateAsync(ids);
      toast.success(`${ids.length} visitor${ids.length > 1 ? "s" : ""} deleted successfully`);
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting visitors:", error);
      toast.error("Failed to delete visitors. Please try again.");
    }
  };

  const handleAdd = () => {
    setSelectedVisitor(null);
    setFormOpen(true);
  };

  const handleEdit = (visitor: VisitorRow) => {
    setSelectedVisitor(visitor);
    setFormOpen(true);
  };

  const handleDelete = (visitor: VisitorRow) => {
    setSelectedVisitor(visitor);
    setDeleteOpen(true);
  };

  return (
    <>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Visitors</h1>
          <p className="page-subtitle">Manage all visitor submissions</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete ({selectedIds.size})
            </Button>
          )}
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Visitor
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by name, industry, or purpose..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={allFilteredSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Detail</TableHead>
              <TableHead>Facility</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No visitors found</TableCell>
              </TableRow>
            ) : (
              filtered.map((v) => (
                <TableRow key={v.id} data-state={selectedIds.has(v.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(v.id)}
                      onCheckedChange={() => toggleSelect(v.id)}
                      aria-label={`Select ${v.full_name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{v.full_name}</TableCell>
                  <TableCell>{v.age}</TableCell>
                  <TableCell className="capitalize">{v.gender}</TableCell>
                  <TableCell>{formatLabel(v.industry)}</TableCell>
                  <TableCell>{v.industry === "marginalized" ? formatLabel(v.marginalized_type ?? "") || "—" : v.industry_detail || "—"}</TableCell>
                  <TableCell>{formatLabel(v.purpose)}</TableCell>
                  <TableCell>{v.visit_date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(v)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(v)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <VisitorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        visitor={selectedVisitor}
      />

      {/* Single Delete Confirmation Dialog */}
      <DeleteVisitorDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        visitor={selectedVisitor}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} Visitor{selectedIds.size > 1 ? "s" : ""}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {selectedIds.size === filtered.length
                  ? `all ${selectedIds.size} visitors`
                  : `${selectedIds.size} selected visitor${selectedIds.size > 1 ? "s" : ""}`}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? "Deleting..." : `Delete ${selectedIds.size}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminVisitors;
