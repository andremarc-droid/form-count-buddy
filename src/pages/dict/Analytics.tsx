import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { computeDictStats, useDictVisitorData } from "@/hooks/useDictVisitorData";
import { useEffect, useSearchParams, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { collection, onSnapshot } from "firebase/firestore";
import { dictDb } from "@/lib/firebase-dict";
import { AttendanceRecord } from "@/types/attendance";

const COLORS = [
    "hsl(215, 75%, 45%)",
    "hsl(165, 55%, 42%)",
    "hsl(38, 92%, 50%)",
    "hsl(280, 60%, 50%)",
    "hsl(0, 72%, 51%)",
];

const computeAttendanceStats = (records: AttendanceRecord[]) => {
    const dailyCounts: Record<string, Set<string>> = {};
    records.forEach(r => {
        if (r.status === "in") {
            if (!dailyCounts[r.date]) dailyCounts[r.date] = new Set();
            dailyCounts[r.date].add(r.fullNameLower);
        }
    });
    const dailyData = Object.entries(dailyCounts)
        .map(([date, set]) => ({ date, count: set.size }))
        .sort((a, b) => a.date.localeCompare(b.date));

    let completed = 0, stillIn = 0, missedOut = 0;
    records.forEach(r => {
        if (r.status === "out") completed++;
        else if (r.status === "in" && !r.timeOut) stillIn++;
        if (r.missedOut) missedOut++;
    });
    const completionData = [
        { name: "Completed", value: completed },
        { name: "Still In", value: stillIn },
        { name: "Missed Out", value: missedOut },
    ];

    const hourCounts = new Array(24).fill(0);
    records.forEach(r => {
        if (r.timeIn) {
            const d = r.timeIn.toDate ? r.timeIn.toDate() : new Date(r.timeIn);
            hourCounts[d.getHours()]++;
        }
    });
    const hourLabels = Array.from({ length: 24 }, (_, i) => {
        const hour = i % 12 || 12;
        const ampm = i < 12 ? "AM" : "PM";
        return `${hour} ${ampm}`;
    });
    const peakHoursData = hourCounts.map((count, i) => ({ hour: hourLabels[i], count }));

    return { dailyData, completionData, peakHoursData };
};

const renderStandardChart = (data: any[], type: "pie" | "bar" | "line", nameKey: string, valueKey: string, isVerticalBar: boolean = false) => {
    if (data.length === 0) return <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>;
    if (type === "bar") {
        if (isVerticalBar) {
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" fontSize={12} tickLine={false} allowDecimals={false} />
                        <YAxis dataKey={nameKey} type="category" width={100} fontSize={12} tickLine={false} tick={{ width: 100 }} />
                        <Tooltip cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
                        <Bar dataKey={valueKey} name="Visitors" radius={[0, 4, 4, 0]}>
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            );
        }
        return (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                    <XAxis dataKey={nameKey} fontSize={11} tickLine={false} interval={0} />
                    <YAxis fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey={valueKey} fill="hsl(215, 75%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        );
    }
    if (type === "line") {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                    <XAxis dataKey={nameKey} fontSize={11} tickLine={false} padding={{ left: 30, right: 30 }} interval={0} />
                    <YAxis fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey={valueKey} name="Visitors" stroke="hsl(215, 75%, 45%)" strokeWidth={2} dot={{ r: 5, fill: "white", strokeWidth: 2 }} activeDot={{ r: 7, strokeWidth: 2 }} />
                </LineChart>
            </ResponsiveContainer>
        );
    }
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey={valueKey}
                    label={({ name, percent }) => percent ? `${name} (${(percent * 100).toFixed(0)}%)` : `${name}`}>
                    {data.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
        </ResponsiveContainer>
    );
};

const renderMonthlyPurposeChart = (data: any[], type: "bar" | "line", purposeKeys: string[]) => {
    if (data.length === 0) return <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>;
    if (type === "line") {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" fontSize={11} tickLine={false} padding={{ left: 30, right: 30 }} />
                    <YAxis fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    {purposeKeys.map((key, i) => (
                        <Line key={key} type="monotone" dataKey={key} name={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        );
    }
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <Tooltip cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                {purposeKeys.map((key, i) => (
                    <Bar key={key} dataKey={key} name={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
};

const DictAnalytics = () => {
    const { data: visitors = [], isLoading: visitorsLoading } = useDictVisitorData();
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [attendanceLoading, setAttendanceLoading] = useState(true);
    const stats = computeDictStats(visitors);
    const attendanceStats = computeAttendanceStats(attendanceRecords);

    useEffect(() => {
        const q = collection(dictDb, "dict_attendance");
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as AttendanceRecord[];
            setAttendanceRecords(data);
            setAttendanceLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const [chart1Type, setChart1Type] = useState<"pie" | "bar" | "line">("bar");
    const [chart2Type, setChart2Type] = useState<"pie" | "bar" | "line">("pie");
    const [chart3Type, setChart3Type] = useState<"bar" | "line">("bar");
    const [chart4Type, setChart4Type] = useState<"pie" | "bar" | "line">("bar");

    const isLoading = visitorsLoading || attendanceLoading;

    const [searchParams] = useSearchParams();
    const activeTab = (searchParams.get("tab") as "attendance" | "visitors") || "attendance";

    const pageHeader = (
        <div className="page-header mb-8">
            <h1 className="page-title text-3xl font-heading font-bold text-foreground">Industry Analytics</h1>
            <p className="page-subtitle text-muted-foreground mt-1">DICT Provincial Office — Deep dive into visitor patterns and industry trends</p>
        </div>
    );

    if (isLoading) {
        return (
            <>
                {pageHeader}
                <div className="flex items-center justify-center p-12 text-muted-foreground animate-pulse">
                    Loading analytics data...
                </div>
            </>
        );
    }

    return (
        <>
            {pageHeader}
            {activeTab !== "attendance" && (
            <div className="space-y-6">
                {/* 1. Number of visitors per industry */}
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-2">
                        <div>
                            <CardTitle className="font-heading text-lg">Visitors per Industry</CardTitle>
                            <CardDescription>Absolute number of visitors by sector</CardDescription>
                        </div>
                        <Select value={chart1Type} onValueChange={(v: "pie" | "bar" | "line") => setChart1Type(v)}>
                            <SelectTrigger className="w-full sm:w-[130px] h-8 text-xs">
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
                            {renderStandardChart(stats.industryData, chart1Type, "name", "value", true)}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Percentage distribution by industry */}
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-2">
                        <div>
                            <CardTitle className="font-heading text-lg">Industry Distribution</CardTitle>
                            <CardDescription>Percentage share by sector</CardDescription>
                        </div>
                        <Select value={chart2Type} onValueChange={(v: "pie" | "bar" | "line") => setChart2Type(v)}>
                            <SelectTrigger className="w-full sm:w-[130px] h-8 text-xs">
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
                            {renderStandardChart(stats.industryData, chart2Type, "name", "value", false)}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Monthly Purpose Distribution */}
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-2">
                        <div>
                            <CardTitle className="font-heading text-lg">Monthly Purpose Distribution</CardTitle>
                            <CardDescription>Breakdown of visit purposes over time</CardDescription>
                        </div>
                        <Select value={chart3Type} onValueChange={(v: "bar" | "line") => setChart3Type(v)}>
                            <SelectTrigger className="w-full sm:w-[130px] h-8 text-xs">
                                <SelectValue placeholder="Chart Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="bar">Bar Graph</SelectItem>
                                <SelectItem value="line">Line Graph</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            {renderMonthlyPurposeChart(stats.purposeByMonth, chart3Type, stats.purposeKeys)}
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Top Occupations */}
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 pb-2">
                        <div>
                            <CardTitle className="font-heading text-lg">Top Occupations &amp; Organizations</CardTitle>
                            <CardDescription>Most frequent visitor backgrounds</CardDescription>
                        </div>
                        <Select value={chart4Type} onValueChange={(v: "pie" | "bar" | "line") => setChart4Type(v)}>
                            <SelectTrigger className="w-full sm:w-[130px] h-8 text-xs">
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
                        <div className="h-[350px]">
                            {renderStandardChart(stats.topOccupations, chart4Type, "name", "count", true)}
                        </div>
                    </CardContent>
                </Card>
            </div>
            )}

            {activeTab === "attendance" && (
            <div className="pt-8 space-y-6">
                <div className="border-t pt-8">
                    <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Attendance Analytics</h2>
                    <p className="text-muted-foreground mb-6">Insights into daily attendance patterns and completion rates</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart 1: Daily Attendance */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="font-heading text-lg">Daily Attendance Count</CardTitle>
                            <CardDescription>Unique people who logged in per day</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                {renderStandardChart(attendanceStats.dailyData, "bar", "date", "count")}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Chart 2: Completion Rate */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="font-heading text-lg">Attendance Completion Rate</CardTitle>
                            <CardDescription>Ratio of completed vs incomplete vs missed records</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                {renderStandardChart(attendanceStats.completionData, "pie", "name", "value")}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Chart 3: Peak Hours */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="font-heading text-lg">Peak Arrival Hours</CardTitle>
                            <CardDescription>Distribution of time-in events across the day</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                {renderStandardChart(attendanceStats.peakHoursData, "bar", "hour", "count")}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            )}
        </>
    );
};

export default DictAnalytics;
