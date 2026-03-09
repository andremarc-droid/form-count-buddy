import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { computeStats, useVisitorData } from "@/hooks/useVisitorData";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = [
    "hsl(215, 75%, 45%)",
    "hsl(165, 55%, 42%)",
    "hsl(38, 92%, 50%)",
    "hsl(280, 60%, 50%)",
    "hsl(0, 72%, 51%)",
];

const Analytics = () => {
    const { data: visitors = [], isLoading } = useVisitorData();
    const stats = computeStats(visitors);

    return (
        <AdminLayout>
            <div className="page-header mb-8">
                <h1 className="page-title text-3xl font-heading font-bold text-foreground">Industry Analytics</h1>
                <p className="page-subtitle text-muted-foreground mt-1">Deep dive into visitor patterns and industry trends</p>
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
                            <CardHeader>
                                <CardTitle className="font-heading text-lg">Visitors per Industry</CardTitle>
                                <CardDescription>Absolute number of visitors by sector</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    {stats.industryData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.industryData} layout="vertical" margin={{ left: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                                <XAxis type="number" fontSize={12} tickLine={false} allowDecimals={false} />
                                                <YAxis dataKey="name" type="category" width={100} fontSize={12} tickLine={false} />
                                                <Tooltip cursor={{ fill: "var(--muted)" }} />
                                                <Bar dataKey="value" name="Total Visitors" radius={[0, 4, 4, 0]}>
                                                    {stats.industryData.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Percentage distribution by industry */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-heading text-lg">Industry Distribution</CardTitle>
                                <CardDescription>Percentage share by sector</CardDescription>
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
                                                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 3. Percentage distribution per purpose by month */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-heading text-lg">Monthly Purpose Distribution</CardTitle>
                                <CardDescription>Breakdown of visit purposes over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[350px]">
                                    {stats.purposeByMonth.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.purposeByMonth} margin={{ top: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="month" fontSize={11} tickLine={false} />
                                                <YAxis fontSize={11} tickLine={false} />
                                                <Tooltip />
                                                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                                                <Bar dataKey="training" stackId="a" name="Training" fill={COLORS[0]} />
                                                <Bar dataKey="coworking" stackId="a" name="Co-working" fill={COLORS[1]} />
                                                <Bar dataKey="conference_room" stackId="a" name="Conference Room" fill={COLORS[2]} />
                                                <Bar dataKey="others" stackId="a" name="Others" fill={COLORS[3]} radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 4. Trend analysis per occupation (optional) */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-heading text-lg">Top Occupations & Organizations</CardTitle>
                                <CardDescription>Most frequent visitor backgrounds</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[350px]">
                                    {stats.topOccupations.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.topOccupations} layout="vertical" margin={{ left: 10 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                                <XAxis type="number" fontSize={11} tickLine={false} allowDecimals={false} />
                                                <YAxis dataKey="name" type="category" width={110} fontSize={11} tickLine={false} tick={{ width: 100 }} />
                                                <Tooltip />
                                                <Bar dataKey="count" name="Visitors" fill="hsl(280, 60%, 50%)" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Analytics;
