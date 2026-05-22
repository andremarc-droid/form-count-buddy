
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { computeDictStats, useDictVisitorData } from "@/hooks/useDictVisitorData";
import { Activity, CalendarDays, ClipboardCheck, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getFirestore, onSnapshot } from "firebase/firestore";
import { addDays, endOfMonth, endOfWeek, format, parseISO, startOfMonth, startOfWeek, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { getDictTab, setDictTab, subscribeDictTab } from "@/lib/dictTabState";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Helper to retrieve CSS variable values for Recharts
const getCSSVariableValue = (variableName: string) => {
  if (typeof window === "undefined") return "";
  return `hsl(${getComputedStyle(document.documentElement).getPropertyValue(variableName).trim()})`;
};

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
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
          <Bar dataKey="value" fill={getCSSVariableValue("--primary")} radius={[4, 4, 0, 0]} />
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
          <Line type="monotone" dataKey="value" stroke={getCSSVariableValue("--primary")} strokeWidth={2} dot={{ r: 5, fill: "white", strokeWidth: 2 }} activeDot={{ r: 7, strokeWidth: 2 }} />
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
            <Cell key={i} fill={`hsl(${COLORS[i % COLORS.length]})`} />
          ))}
        </Pie>
        <Tooltip />
        {showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  );
};

const DictDashboard = () => {
  const [activeTab, setActiveTabState] = useState(getDictTab());
  useEffect(() => {
    return subscribeDictTab(() => setActiveTabState(getDictTab()));
  }, []);
  const { data: visitors = [], attendance = [], isLoading } = useDictVisitorData();

  const [attend, setAttend] = useState<Array<{ id: string; [key: string]: unknown }>>([]);
  useEffect(() => {
    const db = getFirestore();
    const ref = collection(db, "dict_attendance");
    const unsub = onSnapshot(ref, (snap) => {
      setAttend(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.log("Dashboard attendance collection unavailable");
    });
    return () => unsub();
  }, []);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const todayAttendance = attend.filter((a) => (a.date as string) === todayStr).length;
  const thisWeekAttendance = attend.filter((a) => {
    const d = a.date as string;
    return d >= weekStart && d <= weekEnd;
  }).length;
  const thisMonthAttendance = attend.filter((a) => {
    const d = a.date as string;
    return d >= monthStart && d <= monthEnd;
  }).length;
  const totalAttendance = attend.length;

  // Daily trend for attendance (foot traffic chart on attendance tab)
  const attendDailyTrend: { date: string; count: number }[] = [];
  (() => {
    const dates = attend.map((a) => (a.date as string));
    let startDate: Date;
    if (dates.length > 0) {
      const timestamps = dates.map((d) => parseISO(d).getTime());
      startDate = new Date(Math.min(...timestamps));
    } else {
      startDate = subDays(new Date(), 14);
    }
    for (let i = 0; i < 15; i++) {
      const d = format(addDays(startDate, i), "yyyy-MM-dd");
      attendDailyTrend.push({ date: d, count: attend.filter((a) => (a.date as string) === d).length });
    }
  })();

  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [purposeFilter, setPurposeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [dailyChartType, setDailyChartType] = useState<"bar" | "line">("bar");
  const [footTrafficRange, setFootTrafficRange] = useState<"daily" | "weekly" | "monthly">("daily");
  const [industryChartType, setIndustryChartType] = useState<"pie" | "bar" | "line">("pie");
  const [purposeChartType, setPurposeChartType] = useState<"pie" | "bar" | "line">("pie");

  const filtered = visitors.filter((v) => {
    if (industryFilter !== "all" && v.industry !== industryFilter) return false;
    if (purposeFilter !== "all" && v.purpose !== purposeFilter) return false;
    if (dateRange?.from) {
      const visitDate = new Date(v.visit_date);
      if (visitDate < dateRange.from) return false;
      if (dateRange.to && visitDate > dateRange.to) return false;
    }
    return true;
  });

  const stats = computeDictStats(filtered, attendance);

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
        <p className="page-subtitle">DICT Provincial Office — Real-time foot traffic overview</p>
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

      </div>

       {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {activeTab !== "attendance" && statCards.map((s) => (
          <div key={s.label} className="stat-card animate-fade-in shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4" style={{ borderLeftColor: `hsl(var(--${s.color.split("-")[1]}))` }}>
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

      {/* Attendance Overview */}
      <p className="text-sm font-semibold text-foreground mb-3">Attendance Overview</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {activeTab === "attendance" && [
          { label: "Today", value: todayAttendance },
          { label: "This Week", value: thisWeekAttendance },
          { label: "This Month", value: thisMonthAttendance },
          { label: "Total Attendance", value: totalAttendance },
        ].map((s) => (
          <div key={s.label} className="stat-card animate-fade-in shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-l-4" style={{ borderLeftColor: "hsl(var(--green-500))" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <ClipboardCheck className="h-5 w-5" style={{ color: "hsl(var(--green-500))" }} />
            </div>
            <p className="text-3xl font-heading font-bold text-foreground">
              {s.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {activeTab !== "attendance" ? (
        <div>
          {/* Visitor Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Foot Traffic Trend */}
            <Card className="shadow-lg border-border/50">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between space-y-0 pb-2 gap-2">
                <CardTitle className="font-heading text-lg">
                  {footTrafficRange === "daily" ? "Daily" : footTrafficRange === "weekly" ? "Weekly" : "Monthly"} Foot Traffic
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={footTrafficRange} onValueChange={(v: "daily" | "weekly" | "monthly") => setFootTrafficRange(v)}>
                    <SelectTrigger className="w-[110px] h-8 text-xs">
                      <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dailyChartType} onValueChange={(v: "bar" | "line") => setDailyChartType(v)}>
                    <SelectTrigger className="w-[110px] h-8 text-xs">
                      <SelectValue placeholder="Chart Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Graph</SelectItem>
                      <SelectItem value="line">Line Graph</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {dailyChartType === "bar" ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={footTrafficRange === "daily" ? stats.dailyTrend : footTrafficRange === "weekly" ? stats.weeklyTrend : stats.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                        <XAxis dataKey="date" fontSize={11} tickLine={false} />
                        <YAxis fontSize={11} tickLine={false} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill={getCSSVariableValue("--primary")} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={footTrafficRange === "daily" ? stats.dailyTrend : footTrafficRange === "weekly" ? stats.weeklyTrend : stats.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                        <XAxis dataKey="date" fontSize={11} tickLine={false} padding={{ left: 30, right: 30 }} />
                        <YAxis fontSize={11} tickLine={false} allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke={getCSSVariableValue("--primary")} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Industry Pie */}
            <Card className="shadow-lg border-border/50">
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

          {/* Purpose Chart — full width */}
          <Card className="shadow-lg border-border/50 mb-8">
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
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Attendance Check-ins */}
          <Card className="shadow-lg border-border/50">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between space-y-0 pb-2 gap-2">
              <CardTitle className="font-heading text-lg">Daily Check-ins</CardTitle>
              <div className="flex gap-2">
                <Select value={dailyChartType} onValueChange={(v: "bar" | "line") => setDailyChartType(v)}>
                  <SelectTrigger className="w-[110px] h-8 text-xs">
                    <SelectValue placeholder="Chart Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Graph</SelectItem>
                    <SelectItem value="line">Line Graph</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {dailyChartType === "bar" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendDailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                      <XAxis dataKey="date" fontSize={11} tickLine={false} interval={0} />
                      <YAxis fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(150, 60%, 42%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendDailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                      <XAxis dataKey="date" fontSize={11} tickLine={false} padding={{ left: 30, right: 30 }} />
                      <YAxis fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="hsl(150, 60%, 42%)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="font-heading text-lg">Today's Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 py-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Today</span>
                  <span className="font-bold text-lg">{todayAttendance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">This Week</span>
                  <span className="font-bold text-lg">{thisWeekAttendance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-bold text-lg">{thisMonthAttendance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-muted-foreground font-medium">Total Records</span>
                  <span className="font-bold text-lg">{totalAttendance.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </>
  );
};

export default DictDashboard;
