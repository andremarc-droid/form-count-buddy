export interface AttendanceRecord {
  id: string;
  fullName: string;
  fullNameLower: string;
  date: string;
  timeIn: any; // Timestamp
  timeOut: any; // Timestamp | null
  status: "in" | "out";
  missedOut: boolean;
  createdAt: any;
}
