
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { VisitorRow } from "@/hooks/useVisitorData";
import { computeStats, formatLabel, useVisitorData } from "@/hooks/useVisitorData";
import { format } from "date-fns";
import { Download, FileText } from "lucide-react";
import { useState } from "react";

const Reports = () => {
  const { data: allVisitors = [], isLoading } = useVisitorData();
  const [reportType, setReportType] = useState("daily");

  const visitors = allVisitors.filter((v) => {
    if (reportType === "daily") {
      return v.visit_date === format(new Date(), "yyyy-MM-dd");
    }
    if (reportType === "monthly") {
      return v.visit_date.startsWith(format(new Date(), "yyyy-MM"));
    }
    return true; // "industry" or other shows all
  });

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

    const csv = [headers.map((h) => `"${h}"`).join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
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
    <>
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
    </>
  );
};

function generatePDFContent(
  visitors: VisitorRow[],
  stats: ReturnType<typeof computeStats>,
  reportType: string
) {
  const reportDate = format(new Date(), "MMMM dd, yyyy");
  const reportTime = format(new Date(), "hh:mm a");
  const reportLabel = reportType === "daily" ? "Daily" : reportType === "monthly" ? "Monthly" : "Industry";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Foot Traffic Report - ${reportDate}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #1e293b;
          background: #fff;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        .page { padding: 0 48px 48px 48px; }

        /* Header */
        .header {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
          color: #fff;
          padding: 32px 48px;
          margin: 0 -48px 32px -48px;
          position: relative;
        }
        .header::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6);
        }
        .header h1 {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }
        .header-meta {
          display: flex;
          gap: 24px;
          margin-top: 8px;
          font-size: 12px;
          color: #94a3b8;
        }
        .header-meta span { display: flex; align-items: center; gap: 4px; }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
        }
        .stat-card:nth-child(1)::before { background: #10b981; }
        .stat-card:nth-child(2)::before { background: #3b82f6; }
        .stat-card:nth-child(3)::before { background: #8b5cf6; }
        .stat-card:nth-child(4)::before { background: #f59e0b; }
        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1;
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #64748b;
        }

        /* Section */
        .section { margin-bottom: 28px; }
        .section-title {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-title::before {
          content: '';
          width: 4px;
          height: 18px;
          border-radius: 2px;
          background: #3b82f6;
          display: inline-block;
        }

        /* Tables */
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        th {
          background: #f1f5f9;
          font-weight: 600;
          color: #475569;
          padding: 10px 14px;
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border-bottom: 2px solid #e2e8f0;
        }
        td {
          padding: 9px 14px;
          color: #334155;
          border-bottom: 1px solid #f1f5f9;
        }
        tr:nth-child(even) td { background: #f8fafc; }
        tr:last-child td { border-bottom: none; }

        .dist-tables {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 28px;
        }

        /* Percentage bar */
        .pct-cell { display: flex; align-items: center; gap: 8px; }
        .pct-bar-bg {
          flex: 1;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
          max-width: 80px;
        }
        .pct-bar {
          height: 100%;
          border-radius: 3px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
        }

        /* Footer */
        .footer {
          margin-top: 40px;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #94a3b8;
        }

        @media print {
          body { padding: 0; }
          .page { padding: 0 32px 32px 32px; }
          .header { margin: 0 -32px 24px -32px; padding: 24px 32px; }
          .stat-card { break-inside: avoid; }
          table { break-inside: auto; }
          tr { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <h1>Foot Traffic Monitoring Report</h1>
          <div class="header-meta">
            <span>📅 ${reportDate}</span>
            <span>🕐 ${reportTime}</span>
            <span>📊 ${reportLabel} Report</span>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${stats.daily}</div>
            <div class="stat-label">Today</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.weekly}</div>
            <div class="stat-label">This Week</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.monthly}</div>
            <div class="stat-label">This Month</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">Total Visitors</div>
          </div>
        </div>

        <div class="dist-tables">
          <div class="section">
            <div class="section-title">Industry Distribution</div>
            <table>
              <thead>
                <tr><th>Industry</th><th>Count</th><th>Percentage</th></tr>
              </thead>
              <tbody>
                ${stats.industryData.map((d) => `
                  <tr>
                    <td>${d.name}</td>
                    <td style="font-weight:600">${d.value}</td>
                    <td><div class="pct-cell"><span>${d.percentage}%</span><div class="pct-bar-bg"><div class="pct-bar" style="width:${d.percentage}%"></div></div></div></td>
                  </tr>
                `).join("")}
                ${stats.industryData.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:#94a3b8">No data available</td></tr>' : ''}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Purpose Distribution</div>
            <table>
              <thead>
                <tr><th>Purpose</th><th>Count</th><th>Percentage</th></tr>
              </thead>
              <tbody>
                ${stats.purposeData.map((d) => `
                  <tr>
                    <td>${d.name}</td>
                    <td style="font-weight:600">${d.value}</td>
                    <td><div class="pct-cell"><span>${d.percentage}%</span><div class="pct-bar-bg"><div class="pct-bar" style="width:${d.percentage}%"></div></div></div></td>
                  </tr>
                `).join("")}
                ${stats.purposeData.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:#94a3b8">No data available</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        </div>

        ${reportType !== "industry" ? `
        <div class="section">
          <div class="section-title">Visitor Log</div>
          <table>
            <thead>
              <tr><th>Name</th><th>Age</th><th>Gender</th><th>Industry</th><th>Purpose</th><th>Date</th></tr>
            </thead>
            <tbody>
              ${visitors.slice(0, 100).map((v) => `
                <tr>
                  <td style="font-weight:500">${v.full_name}</td>
                  <td>${v.age}</td>
                  <td>${v.gender}</td>
                  <td>${formatLabel(v.industry)}</td>
                  <td>${formatLabel(v.purpose)}</td>
                  <td>${v.visit_date}</td>
                </tr>
              `).join("")}
              ${visitors.length === 0 ? '<tr><td colspan="6" style="text-align:center;color:#94a3b8">No visitors recorded</td></tr>' : ''}
            </tbody>
          </table>
          ${visitors.length > 100 ? '<p style="margin-top:8px;font-size:11px;color:#94a3b8;text-align:center">Showing first 100 of ' + visitors.length + ' visitors</p>' : ''}
        </div>` : ""}

        <div class="footer">
          <span>Digital Transformation Centers — Foot Traffic Monitor</span>
          <span>Generated on ${reportDate} at ${reportTime}</span>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default Reports;
