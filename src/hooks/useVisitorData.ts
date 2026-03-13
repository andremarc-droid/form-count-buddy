import { db } from "@/lib/firebase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, endOfMonth, endOfWeek, format, parseISO, startOfMonth, startOfWeek, subDays } from "date-fns";
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";

export type VisitorRow = {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  industry: string;
  industry_detail: string | null;
  industry_location: string | null;
  marginalized_type: string | null;
  academe_type: string | null;
  government_position: string | null;
  purpose: string;
  purpose_detail: string | null;
  visit_date: string;
  visit_time: string;
  created_at: string;
};

export function useVisitorData(dateRange?: { from: Date; to: Date }) {
  return useQuery({
    queryKey: ["visitors", dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async () => {
      const visitorsRef = collection(db, "visitors");
      const q = query(visitorsRef, orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);

      const rows: VisitorRow[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        const ts = d.timestamp?.toDate ? d.timestamp.toDate() : new Date();

        return {
          id: doc.id,
          full_name: d.full_name ?? "",
          age: d.age ?? 0,
          gender: d.gender ?? "",
          industry: d.industry ?? "",
          industry_detail: d.industry_detail ?? null,
          industry_location: d.industry_location ?? null,
          marginalized_type: d.marginalized_type ?? null,
          academe_type: d.academe_type ?? null,
          government_position: d.government_position ?? null,
          purpose: d.purpose ?? "",
          purpose_detail: d.purpose_detail ?? null,
          visit_date: format(ts, "yyyy-MM-dd"),
          visit_time: format(ts, "HH:mm:ss"),
          created_at: ts.toISOString(),
        };
      });

      return rows;
    },
  });
}

export type VisitorFormData = Omit<VisitorRow, "id" | "visit_date" | "visit_time" | "created_at">;

export function useAddVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: VisitorFormData) => {
      await addDoc(collection(db, "visitors"), {
        ...data,
        timestamp: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
    },
  });
}

export function useUpdateVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: VisitorFormData }) => {
      const docRef = doc(db, "visitors", id);
      await updateDoc(docRef, { ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
    },
  });
}

export function useDeleteVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const docRef = doc(db, "visitors", id);
      await deleteDoc(docRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
    },
  });
}

export function useBulkDeleteVisitors() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const deletePromises = ids.map((id) => {
        const docRef = doc(db, "visitors", id);
        return deleteDoc(docRef);
      });
      await Promise.all(deletePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
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
    const rawPurpose = v.purpose === "others" && v.purpose_detail ? v.purpose_detail : v.purpose;
    purposeCount[rawPurpose] = (purposeCount[rawPurpose] || 0) + 1;
  });

  const purposeData = Object.entries(purposeCount).map(([name, value]) => {
    // If formatLabel falls back to key (doesn't exist in predefined labels), it just uses the specific inputted text
    const label = formatLabel(name);
    return {
      name: label === name ? name : label,
      value,
      percentage: data.length ? Math.round((value / data.length) * 100) : 0,
    };
  });

  // Daily trend (15 days starting from the very first entry)
  const dailyTrend: { date: string; count: number }[] = [];

  // Find the earliest date in the data
  let startDate = new Date();
  if (data.length > 0) {
    const dates = data.map(v => parseISO(v.visit_date).getTime());
    startDate = new Date(Math.min(...dates));
  } else {
    // If no data, default to today minus 14 (showing the last 15 days)
    startDate = subDays(new Date(), 14);
  }

  // Generate 15 days starting from that first entry
  for (let i = 0; i < 15; i++) {
    const d = format(addDays(startDate, i), "yyyy-MM-dd");
    dailyTrend.push({
      date: format(parseISO(d), "MMM dd"),
      count: data.filter((v) => v.visit_date === d).length,
    });
  }

  // Weekly trend (last 12 weeks from startDate)
  const weeklyTrend: { date: string; count: number }[] = [];
  let currentStartW = startOfWeek(startDate, { weekStartsOn: 1 });
  for (let i = 0; i < 12; i++) {
    const wDate = addDays(currentStartW, i * 7);
    const label = format(wDate, "MMM dd");
    const endWDate = format(addDays(wDate, 6), "yyyy-MM-dd");
    const startWStr = format(wDate, "yyyy-MM-dd");
    
    weeklyTrend.push({
      date: label,
      count: data.filter((v) => v.visit_date >= startWStr && v.visit_date <= endWDate).length,
    });
  }

  // Monthly trend (last 12 months from startDate)
  const monthlyTrend: { date: string; count: number }[] = [];
  let currentStartM = startOfMonth(startDate);
  for (let i = 0; i < 12; i++) {
    const mDate = startOfMonth(addDays(currentStartM, i * 32)); // rough jump to cover next months safely, startOfMonth normalizes it
    const label = format(mDate, "MMM yyyy");
    const endMDate = format(endOfMonth(mDate), "yyyy-MM-dd");
    const startMStr = format(mDate, "yyyy-MM-dd");

    // Only add if we haven't added this month yet (due to the rough jump)
    if (!monthlyTrend.find(m => m.date === label)) {
      monthlyTrend.push({
        date: label,
        count: data.filter((v) => v.visit_date >= startMStr && v.visit_date <= endMDate).length,
      });
    }
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

  return { daily, weekly, monthly, total: data.length, industryData, purposeData, dailyTrend, weeklyTrend, monthlyTrend, purposeByMonth, topOccupations };
}

export function formatLabel(key: string): string {
  const labels: Record<string, string> = {
    academe: "Academe",
    government: "Government",
    private_sector: "Private Sector",
    msme: "MSME's",
    marginalized: "Marginalized",
    pwd: "PWD",
    unemployed: "Unemployed",
    senior: "Senior Citizen",
    student: "Student",
    instructor: "Instructor",
    training: "Training",
    coworking: "Co-working",
    conference_room: "Conference Room",
  };
  return labels[key] || key;
}

export function formatIndustryDetail(v: VisitorRow | (Omit<VisitorRow, "id" | "visit_date" | "visit_time" | "created_at"> & { id?: string })): string {
  if (v.industry === "marginalized") {
    return v.marginalized_type ? formatLabel(v.marginalized_type) : "—";
  }
  if (v.industry === "academe") {
    return [v.industry_detail, v.academe_type ? formatLabel(v.academe_type) : null].filter(Boolean).join(" - ") || "—";
  }
  if (v.industry === "government") {
    return [v.industry_detail, v.government_position].filter(Boolean).join(" - ") || "—";
  }
  return v.industry_detail || "—";
}
