import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { dictDb } from "@/lib/firebase-dict";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DictAttendanceFormDialog } from "@/components/DictAttendanceFormDialog";
import { DictDeleteAttendanceDialog } from "@/components/DictDeleteAttendanceDialog";
import { AttendanceRecord } from "@/types/attendance";

const DictAttendanceAdmin = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  useEffect(() => {
    const q = query(collection(dictDb, "dict_attendance"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];
      setRecords(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filtered = records.filter((r) => {
    const matchesSearch = r.fullName.toLowerCase().includes(search.toLowerCase());
    const matchesDate = dateFilter === "" || r.date === dateFilter;

    let matchesStatus = true;
    if (statusFilter === "in") matchesStatus = r.status === "in";
    else if (statusFilter === "out") matchesStatus = r.status === "out";
    else if (statusFilter === "missed") matchesStatus = r.missedOut === true;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "—";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "h:mm a");
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const handleEdit = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setFormOpen(true);
  };

  const handleDelete = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setDeleteOpen(true);
  };

  return (
    <>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">DICT Provincial Office — Attendance logs</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full sm:w-auto"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-auto">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="in">In</SelectItem>
              <SelectItem value="out">Out</SelectItem>
              <SelectItem value="missed">Missed Out</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time In</TableHead>
              <TableHead>Time Out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Alerts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No attendance records found</TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow
                  key={r.id}
                  className={cn(r.missedOut && "bg-red-50/50 hover:bg-red-50")}
                >
                  <TableCell className="font-medium">{r.fullName}</TableCell>
                  <TableCell>{formatDate(r.date)}</TableCell>
                  <TableCell>{formatTimestamp(r.timeIn)}</TableCell>
                  <TableCell>{formatTimestamp(r.timeOut)}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "in" ? "default" : "secondary"} className={r.status === "in" ? "bg-green-600 hover:bg-green-600" : "bg-gray-400 hover:bg-gray-400 text-white"}>
                      {r.status === "in" ? "IN" : "OUT"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {r.missedOut && (
                      <Badge variant="destructive" className="bg-red-600 hover:bg-red-600">
                        Missed Out
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(r)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(r)}
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

      <DictAttendanceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        record={selectedRecord}
      />

      <DictDeleteAttendanceDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        record={selectedRecord}
      />
    </>
  );
};

export default DictAttendanceAdmin;
