import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { computeStats, useVisitorData } from "@/hooks/useVisitorData";
import { Activity, CalendarDays, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "hsl(215, 75%, 45%)",
  "hsl(165, 55%, 42%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 60%, 50%)",
  "hsl(0, 72%, 51%)",
];

const Dashboard = () => {
  const { data: visitors = [], isLoading } = useVisitorData();
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [purposeFilter, setPurposeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const filtered = visitors.filter((v) => {
    if (industryFilter !== "all" && v.industry !== industryFilter) return false;
    if (purposeFilter !== "all" && v.purpose !== purposeFilter) return false;
    // Apply Date Range Filter
    if (dateRange?.from) {
      const visitDate = new Date(v.visit_date);
      if (visitDate < dateRange.from) return false;
      if (dateRange.to && visitDate > dateRange.to) return false;
    }
    return true;
  });

  const stats = computeStats(filtered);

  const statCards = [
    { label: "Today", value: stats.daily, icon: Activity, color: "text-primary" },
    { label: "This Week", value: stats.weekly, icon: CalendarDays, color: "text-accent" },
    { label: "This Month", value: stats.monthly, icon: TrendingUp, color: "text-warning" },
    { label: "Total Visitors", value: stats.total, icon: Users, color: "text-info" },
  ];

  return (
    <AdminLayout>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Real-time foot traffic overview</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />

        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            <SelectItem value="academe">Academe</SelectItem>
            <SelectItem value="government">Government</SelectItem>
            <SelectItem value="private_sector">Private Sector</SelectItem>
            <SelectItem value="msme">MSME's</SelectItem>
            <SelectItem value="marginalized">Marginalized</SelectItem>
          </SelectContent>
        </Select>
        <Select value={purposeFilter} onValueChange={setPurposeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Purposes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Purposes</SelectItem>
            <SelectItem value="training">Training</SelectItem>
            <SelectItem value="coworking">Co-working</SelectItem>
            <SelectItem value="conference_room">Conference Room</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="stat-card animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-3xl font-heading font-bold text-foreground">
              {isLoading ? "—" : s.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Industry Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Visitors by Industry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {stats.industryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.industryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                    >
                      {stats.industryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purpose Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Visitors by Purpose</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {stats.purposeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.purposeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                  >
                    {stats.purposeData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Dashboard;
