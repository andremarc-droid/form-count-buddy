
import { DeleteVisitorDialog } from "@/components/DeleteVisitorDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VisitorFormDialog } from "@/components/VisitorFormDialog";
import { formatLabel, useVisitorData, type VisitorRow } from "@/hooks/useVisitorData";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const AdminVisitors = () => {
  const { data: visitors = [], isLoading } = useVisitorData();
  const [search, setSearch] = useState("");

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<VisitorRow | null>(null);

  const filtered = visitors.filter((v) =>
    v.full_name.toLowerCase().includes(search.toLowerCase()) ||
    v.industry.toLowerCase().includes(search.toLowerCase()) ||
    v.purpose.toLowerCase().includes(search.toLowerCase())
  );

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
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Visitor
        </Button>
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
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Detail</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No visitors found</TableCell>
              </TableRow>
            ) : (
              filtered.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.full_name}</TableCell>
                  <TableCell>{v.age}</TableCell>
                  <TableCell className="capitalize">{v.gender}</TableCell>
                  <TableCell>{formatLabel(v.industry)}</TableCell>
                  <TableCell>{v.industry_detail || "—"}</TableCell>
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

      {/* Delete Confirmation Dialog */}
      <DeleteVisitorDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        visitor={selectedVisitor}
      />
    </>
  );
};

export default AdminVisitors;
