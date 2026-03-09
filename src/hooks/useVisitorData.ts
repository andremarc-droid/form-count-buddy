import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { endOfMonth, endOfWeek, format, parseISO, startOfMonth, startOfWeek, subDays } from "date-fns";

export type VisitorRow = {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  industry: string;
  industry_detail: string | null;
  industry_location: string | null;
  marginalized_type: string | null;
  purpose: string;
  visit_date: string;
  visit_time: string;
  created_at: string;
};

export function useVisitorData(dateRange?: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ["visitors", dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async () => {
      let query = supabase.from("visitors").select("*").order("created_at", { ascending: false });

      if (dateRange?.from) {
        query = query.gte("visit_date", format(dateRange.from, "yyyy-MM-dd"));
      }
      if (dateRange?.to) {
        query = query.lte("visit_date", format(dateRange.to, "yyyy-MM-dd"));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as VisitorRow[];
    },
  });
}

export function computeStats(data: VisitorRow[]) {
  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const daily = data.filter((v) => v.visit_date === today).length;
  const weekly = data.filter((v) => v.visit_date >= weekStart && v.visit_date <= weekEnd).length;
  const monthly = data.filter((v) => v.visit_date >= monthStart && v.visit_date <= monthEnd).length;

  // Industry distribution
  const industryCount: Record<string, number> = {};
  data.forEach((v) => {
    industryCount[v.industry] = (industryCount[v.industry] || 0) + 1;
  });

  const industryData = Object.entries(industryCount).map(([name, value]) => ({
    name: formatLabel(name),
    value,
    percentage: data.length ? Math.round((value / data.length) * 100) : 0,
  }));

  // Purpose distribution
  const purposeCount: Record<string, number> = {};
  data.forEach((v) => {
    purposeCount[v.purpose] = (purposeCount[v.purpose] || 0) + 1;
  });

  const purposeData = Object.entries(purposeCount).map(([name, value]) => ({
    name: formatLabel(name),
    value,
    percentage: data.length ? Math.round((value / data.length) * 100) : 0,
  }));

  // Daily trend (last 30 days)
  const dailyTrend: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = format(subDays(new Date(), i), "yyyy-MM-dd");
    dailyTrend.push({
      date: format(parseISO(d), "MMM dd"),
      count: data.filter((v) => v.visit_date === d).length,
    });
  }

  // Purpose by Month
  const monthlyPurposeCount: Record<string, Record<string, number>> = {};
  data.forEach((v) => {
    const month = format(parseISO(v.visit_date), "MMM yyyy");
    if (!monthlyPurposeCount[month]) {
      monthlyPurposeCount[month] = {
        training: 0,
        coworking: 0,
        conference_room: 0,
        others: 0,
      };
    }
    monthlyPurposeCount[month][v.purpose] = (monthlyPurposeCount[month][v.purpose] || 0) + 1;
  });

  const purposeByMonth = Object.entries(monthlyPurposeCount)
    .map(([month, counts]) => ({ month, ...counts }))
    .reverse();

  // Top Occupations (from industry_detail)
  const occupationCount: Record<string, number> = {};
  data.forEach((v) => {
    if (v.industry_detail) {
      const occ = v.industry_detail.trim();
      if (occ) {
        occupationCount[occ] = (occupationCount[occ] || 0) + 1;
      }
    }
  });

  const topOccupations = Object.entries(occupationCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  return { daily, weekly, monthly, total: data.length, industryData, purposeData, dailyTrend, purposeByMonth, topOccupations };
}

export function formatLabel(key: string): string {
  const labels: Record<string, string> = {
    academe: "Academe",
    government: "Government",
    private_sector: "Private Sector",
    msme: "MSME's",
    marginalized: "Marginalized",
    training: "Training",
    coworking: "Co-working",
    conference_room: "Conference Room",
  };
  return labels[key] || key;
}
