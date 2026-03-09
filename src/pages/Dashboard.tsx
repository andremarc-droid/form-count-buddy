
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { computeStats, useVisitorData } from "@/hooks/useVisitorData";
import { Activity, CalendarDays, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = [
  "hsl(215, 75%, 45%)",
  "hsl(165, 55%, 42%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 60%, 50%)",
  "hsl(0, 72%, 51%)",
];

const DynamicChart = ({ data, type, showLegend = false }: { data: any[], type: "pie" | "bar" | "line", showLegend?: boolean }) => {
  if (data.length === 0) {
    return <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>;
  }

  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
          <XAxis dataKey="name" fontSize={11} tickLine={false} interval={0} />
          <YAxis fontSize={11} tickLine={false} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="hsl(215, 75%, 45%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
          <XAxis dataKey="name" fontSize={11} tickLine={false} padding={{ left: 30, right: 30 }} interval={0} />
          <YAxis fontSize={11} tickLine={false} allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="hsl(215, 75%, 45%)" strokeWidth={2} dot={{ r: 5, fill: "white", strokeWidth: 2 }} activeDot={{ r: 7, strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          label={({ name, percentage }) => `${name} (${percentage}%)`}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        {showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );
};

const Dashboard = () => {
  const { data: visitors = [], isLoading } = useVisitorData();
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [purposeFilter, setPurposeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [dailyChartType, setDailyChartType] = useState<"bar" | "line">("bar");
  const [industryChartType, setIndustryChartType] = useState<"pie" | "bar" | "line">("pie");
  const [purposeChartType, setPurposeChartType] = useState<"pie" | "bar" | "line">("pie");

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
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Real-time foot traffic overview</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row flex-wrap items-start md:items-center gap-3 mb-6">
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />

        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
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
          <SelectTrigger className="w-full md:w-[180px]">
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
        {/* Daily Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-heading text-lg">Daily Foot Traffic (Last 30 Days)</CardTitle>
            <Select value={dailyChartType} onValueChange={(v: "bar" | "line") => setDailyChartType(v)}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Graph</SelectItem>
                <SelectItem value="line">Line Graph</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {dailyChartType === "bar" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                    <XAxis dataKey="date" fontSize={11} tickLine={false} />
                    <YAxis fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(215, 75%, 45%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                    <XAxis dataKey="date" fontSize={11} tickLine={false} padding={{ left: 30, right: 30 }} />
                    <YAxis fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="hsl(215, 75%, 45%)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Industry Pie */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-heading text-lg">Visitors by Industry</CardTitle>
            <Select value={industryChartType} onValueChange={(v: "pie" | "bar" | "line") => setIndustryChartType(v)}>
              <SelectTrigger className="w-[130px] h-8 text-xs">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="bar">Bar Graph</SelectItem>
                <SelectItem value="line">Line Graph</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <DynamicChart data={stats.industryData} type={industryChartType} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Purpose Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-heading text-lg">Visitors by Purpose</CardTitle>
          <Select value={purposeChartType} onValueChange={(v: "pie" | "bar" | "line") => setPurposeChartType(v)}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="bar">Bar Graph</SelectItem>
              <SelectItem value="line">Line Graph</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <DynamicChart data={stats.purposeData} type={purposeChartType} showLegend />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Dashboard;
