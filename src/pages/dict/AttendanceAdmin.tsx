import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AttendanceAdmin = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link to="/dict/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Attendance Administration</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Management</CardTitle>
          <CardDescription>
            This is a scaffold for the attendance administration page.
            Monitoring and reporting for dict_attendance will be implemented here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            Attendance logs and reports are currently under development.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceAdmin;
