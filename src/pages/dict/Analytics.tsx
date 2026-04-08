
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { computeDictStats, useDictVisitorData } from "@/hooks/useDictVisitorData";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = [
    "hsl(215, 75%, 45%)",
    "hsl(165, 55%, 42%)",
    "hsl(38, 92%, 50%)",
    "hsl(280, 60%, 50%)",
    "hsl(0, 72%, 51%)",
];

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
        } else {
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
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey={valueKey}
                    label={({ name, percent }) => percent ? `${name} (${(percent * 100).toFixed(0)}%)` : `${name}`}
                >
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
    const { data: visitors = [], isLoading } = useDictVisitorData();
    const stats = computeDictStats(visitors);

    const [chart1Type, setChart1Type] = useState<"pie" | "bar" | "line">("bar");
    const [chart2Type, setChart2Type] = useState<"pie" | "bar" | "line">("pie");
    const [chart3Type, setChart3Type] = useState<"bar" | "line">("bar");
    const [chart4Type, setChart4Type] = useState<"pie" | "bar" | "line">("bar");

    return (
        <>
            <div className="page-header mb-8">
                <h1 className="page-title text-3xl font-heading font-bold text-foreground">Industry Analytics</h1>
                <p className="page-subtitle text-muted-foreground mt-1">DICT Provincial Office — Deep dive into visitor patterns and industry trends</p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-12 text-muted-foreground animate-pulse">
                    Loading analytics data...
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                    <CardTitle className="font-heading text-lg">Top Occupations & Organizations</CardTitle>
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
                </div>
            )}
        </>
    );
};

export default DictAnalytics;
