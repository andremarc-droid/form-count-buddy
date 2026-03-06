import AdminLayout from "@/components/AdminLayout";
import { useVisitorData, computeStats, formatLabel } from "@/hooks/useVisitorData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import type { VisitorRow } from "@/hooks/useVisitorData";

const Reports = () => {
  const { data: visitors = [], isLoading } = useVisitorData();
  const [reportType, setReportType] = useState("daily");
  const stats = computeStats(visitors);

  const exportCSV = () => {
    const headers = ["Full Name", "Age", "Gender", "Industry", "Detail", "Location", "Purpose", "Date"];
    const rows = visitors.map((v) => [
      v.full_name,
      v.age,
      v.gender,
      formatLabel(v.industry),
      v.industry_detail || "",
      v.industry_location || "",
      formatLabel(v.purpose),
      v.visit_date,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitors-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const printContent = generatePDFContent(visitors, stats, reportType);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <AdminLayout>
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Generate and export visitor reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={exportPDF} disabled={isLoading}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily Summary</SelectItem>
            <SelectItem value="monthly">Monthly Summary</SelectItem>
            <SelectItem value="industry">Industry Summary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Summary Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Today</span>
              <span className="font-semibold">{stats.daily}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">This Week</span>
              <span className="font-semibold">{stats.weekly}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">This Month</span>
              <span className="font-semibold">{stats.monthly}</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-muted-foreground font-medium">Total</span>
              <span className="font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        {/* Industry Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">By Industry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.industryData.length === 0 ? (
              <p className="text-muted-foreground">No data</p>
            ) : (
              stats.industryData.map((d) => (
                <div key={d.name} className="flex justify-between">
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-semibold">{d.value} ({d.percentage}%)</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Purpose Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">By Purpose</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.purposeData.length === 0 ? (
              <p className="text-muted-foreground">No data</p>
            ) : (
              stats.purposeData.map((d) => (
                <div key={d.name} className="flex justify-between">
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-semibold">{d.value} ({d.percentage}%)</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

function generatePDFContent(
  visitors: VisitorRow[],
  stats: ReturnType<typeof computeStats>,
  reportType: string
) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Foot Traffic Report - ${format(new Date(), "MMMM dd, yyyy")}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { font-size: 24px; margin-bottom: 4px; }
        h2 { font-size: 18px; margin-top: 24px; color: #555; }
        .subtitle { color: #888; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 13px; }
        th { background: #f5f5f5; font-weight: 600; }
        .stat { display: inline-block; margin-right: 32px; margin-bottom: 16px; }
        .stat-value { font-size: 28px; font-weight: bold; }
        .stat-label { color: #888; font-size: 13px; }
      </style>
    </head>
    <body>
      <h1>Foot Traffic Monitoring Report</h1>
      <p class="subtitle">Generated on ${format(new Date(), "MMMM dd, yyyy 'at' hh:mm a")}</p>
      
      <div>
        <div class="stat"><div class="stat-value">${stats.daily}</div><div class="stat-label">Today</div></div>
        <div class="stat"><div class="stat-value">${stats.weekly}</div><div class="stat-label">This Week</div></div>
        <div class="stat"><div class="stat-value">${stats.monthly}</div><div class="stat-label">This Month</div></div>
        <div class="stat"><div class="stat-value">${stats.total}</div><div class="stat-label">Total</div></div>
      </div>

      <h2>Industry Distribution</h2>
      <table>
        <tr><th>Industry</th><th>Count</th><th>Percentage</th></tr>
        ${stats.industryData.map((d) => `<tr><td>${d.name}</td><td>${d.value}</td><td>${d.percentage}%</td></tr>`).join("")}
      </table>

      <h2>Purpose Distribution</h2>
      <table>
        <tr><th>Purpose</th><th>Count</th><th>Percentage</th></tr>
        ${stats.purposeData.map((d) => `<tr><td>${d.name}</td><td>${d.value}</td><td>${d.percentage}%</td></tr>`).join("")}
      </table>

      ${reportType !== "industry" ? `
      <h2>Visitor Log</h2>
      <table>
        <tr><th>Name</th><th>Age</th><th>Gender</th><th>Industry</th><th>Purpose</th><th>Date</th></tr>
        ${visitors.slice(0, 100).map((v) => `<tr><td>${v.full_name}</td><td>${v.age}</td><td>${v.gender}</td><td>${formatLabel(v.industry)}</td><td>${formatLabel(v.purpose)}</td><td>${v.visit_date}</td></tr>`).join("")}
      </table>` : ""}
    </body>
    </html>
  `;
}

export default Reports;
