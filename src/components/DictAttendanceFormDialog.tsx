import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { dictDb } from "@/lib/firebase-dict";
import { toast } from "sonner";
import { AttendanceRecord } from "@/types/attendance";

interface DictAttendanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: AttendanceRecord | null;
}

export function DictAttendanceFormDialog({
  open,
  onOpenChange,
  record,
}: DictAttendanceFormDialogProps) {
  const [fullName, setFullName] = useState("");
  const [date, setDate] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [timeOut, setTimeOut] = useState("");
  const [status, setStatus] = useState<"in" | "out">("in");
  const [missedOut, setMissedOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (record) {
      setFullName(record.fullName);
      setDate(record.date);

      // Format timeIn to HH:mm
      if (record.timeIn) {
        const d = record.timeIn.toDate ? record.timeIn.toDate() : new Date(record.timeIn);
        setTimeIn(d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
      }

      // Format timeOut to HH:mm
      if (record.timeOut) {
        const d = record.timeOut.toDate ? record.timeOut.toDate() : new Date(record.timeOut);
        setTimeOut(d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
      } else {
        setTimeOut("");
      }

      setStatus(record.status);
      setMissedOut(record.missedOut);
    } else {
      // Reset if no record (though this dialog is only for edit)
      setFullName("");
      setDate("");
      setTimeIn("");
      setTimeOut("");
      setStatus("in");
      setMissedOut(false);
    }
  }, [record]);

  const combineDateAndTime = (dateStr: string, timeStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const [hours, minutes] = timeStr.split(":").map(Number);
    return Timestamp.fromDate(new Date(year, month - 1, day, hours, minutes));
  };

  const handleSave = async () => {
    if (!record) return;
    setIsSaving(true);
    try {
      let finalStatus = status;
      let finalMissedOut = missedOut;

      // Logic: If Time Out is manually set and was previously null, set status to "out"
      if (timeOut && !record.timeOut) {
        finalStatus = "out";
      }
      // Logic: If Time Out is cleared/removed, set status back to "in" and missedOut to false
      if (!timeOut && record.timeOut) {
        finalStatus = "in";
        finalMissedOut = false;
      }

      const updates: any = {
        fullName,
        fullNameLower: fullName.toLowerCase(),
        date,
        status: finalStatus,
        missedOut: finalMissedOut,
      };

      if (timeIn) {
        updates.timeIn = combineDateAndTime(date, timeIn);
      }
      if (timeOut) {
        updates.timeOut = combineDateAndTime(date, timeOut);
      } else {
        updates.timeOut = null;
      }

      await updateDoc(doc(dictDb, "dict_attendance", record.id), updates);
      toast.success("Attendance record updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating record:", error);
      toast.error("Failed to update record. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Attendance Record</DialogTitle>
          <DialogDescription>
            Update the attendance details for this record.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="timeIn">Time In</Label>
              <Input
                id="timeIn"
                type="time"
                value={timeIn}
                onChange={(e) => setTimeIn(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="timeOut">Time Out</Label>
              <Input
                id="timeOut"
                type="time"
                value={timeOut}
                onChange={(e) => setTimeOut(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">In</SelectItem>
                <SelectItem value="out">Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="missedOut"
              checked={missedOut}
              onCheckedChange={(val) => setMissedOut(!!val)}
            />
            <Label htmlFor="missedOut" className="cursor-pointer">Missed Out</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
