// TODO: Replace these imports with actual DICT assets when available
import bgImage from "@/assets/DICT-background.jpg";
import logoImage from "@/assets/DICT-Malaybalay.png";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";
import { dictDb } from "@/lib/firebase-dict";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection, serverTimestamp, getDocs, query, where, Timestamp } from "firebase/firestore";
import { ArrowLeft, CheckCircle2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { isFuzzyMatch } from "@/lib/utils";
import { useDictVisitorData } from "@/hooks/useDictVisitorData";
import { toast } from "sonner";

type Industry = Database["public"]["Enums"]["visitor_industry"];
type Purpose = Database["public"]["Enums"]["visit_purpose"];
type MarginalizedType = Database["public"]["Enums"]["marginalized_type"];

const visitorSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(100),
  age: z.coerce.number().int().min(1, "Age must be at least 1").max(149, "Invalid age"),
  gender: z.string().min(1, "Gender is required"),
  industry: z.enum(["academe", "government", "private_sector", "msme", "marginalized"] as const),
  industry_detail: z.string().max(200).optional(),
  industry_location: z.string().max(200).optional(),
  marginalized_type: z.enum(["pwd", "unemployed", "senior"] as const).optional(),
  academe_type: z.enum(["student", "instructor", "non_teaching_staff"] as const).optional(),
  government_position: z.string().max(200).optional(),
  purpose: z.enum(["training", "coworking", "conference_room", "others"] as const),
  purpose_detail: z.string().max(200).optional(),
});

type VisitorFormData = z.infer<typeof visitorSchema>;

const industryLabels: Record<Industry, string> = {
  academe: "Academe",
  government: "Government",
  private_sector: "Private Sector",
  msme: "MSME's",
  marginalized: "Marginalized Sector",
};

const purposeLabels: Record<Purpose, string> = {
  training: "Training Room",
  coworking: "Co-working Room",
  conference_room: "Conference Room",
  others: "Uban Pa/Others",
};

const marginalizedLabels: Record<MarginalizedType, string> = {
  pwd: "PWD",
  unemployed: "Unemployed",
  senior: "Senior Citizen",
};

const industryDetailPlaceholders: Record<Industry, string> = {
  academe: "School name (e.g., University of the Philippines)",
  government: "Office name (e.g., DOST, DTI)",
  private_sector: "Agency/Company or Freelancer",
  msme: "Business name",
  marginalized: "",
};

const industryLocationPlaceholders: Record<Industry, string> = {
  academe: "",
  government: "",
  private_sector: "Location (e.g., Cebu City)",
  msme: "Location (e.g., Davao City)",
  marginalized: "",
};

const DictVisitorForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { data: allVisitors = [] } = useDictVisitorData();

  // Force light mode on visitor form
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
  }, []);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<VisitorFormData>({
    resolver: zodResolver(visitorSchema),
  });

  const selectedIndustry = watch("industry");
  const selectedPurpose = watch("purpose");

  const onSubmit = async (data: VisitorFormData) => {
    setIsSubmitting(true);
    try {
      // Run smart duplicate check for today's entries
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const q = query(
        collection(dictDb, "visitors"),
        where("timestamp", ">=", Timestamp.fromDate(todayStart)),
        where("timestamp", "<=", Timestamp.fromDate(todayEnd))
      );
      
      const snapshot = await getDocs(q);
      const existingTodayNames = snapshot.docs.map(doc => doc.data().full_name as string);

      const isDuplicate = existingTodayNames.some((name) => name && isFuzzyMatch(name, data.full_name));

      if (isDuplicate) {
        toast.error("It looks like you have already registered today.");
        setIsSubmitting(false);
        return;
      }

      // Clean the data
      const cleanedData: Record<string, unknown> = {
        full_name: data.full_name,
        age: data.age,
        gender: data.gender,
        industry: data.industry,
        industry_detail: data.industry_detail ?? null,
        industry_location: data.industry_location ?? null,
        marginalized_type: data.marginalized_type ?? null,
        academe_type: data.academe_type ?? null,
        government_position: data.government_position ?? null,
        purpose: data.purpose,
        purpose_detail: data.purpose_detail ?? null,
      };

      await addDoc(collection(dictDb, "visitors"), {
        ...cleanedData,
        timestamp: serverTimestamp(),
      });
      setSubmitted(true);
      reset();
    } catch (error) {
      console.error("Error submitting form data: ", error);
      alert("There was an error submitting your registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 flex-col gap-4 relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm z-0"></div>
        <Button asChild variant="outline" size="sm" className="absolute top-6 left-6 shadow-sm z-50">
          <Link to="/dict">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <Card className="w-full max-w-md text-center animate-fade-in shadow-2xl z-10 bg-card/95 border-border/50 backdrop-blur-md rounded-3xl">
          <CardContent className="pt-10 pb-10">
            <CheckCircle2 className="mx-auto h-16 w-16 text-primary mb-4" />
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Daghang Salamat!</h2>
            <p className="text-muted-foreground mb-6">Dako kaayo namong gipasalamatan ang inyong kooperasyon. Ang inyong impormasyon malampusong naitala alang sa monitoring ug record-keeping nga katuyoan.</p>
            <Button onClick={() => navigate("/dict")} className="w-full shadow-md h-12 rounded-full transition-all duration-300 hover:-translate-y-1">
              <LogOut className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-[100dvh] py-8 px-4 sm:p-6 relative bg-cover bg-center bg-no-repeat overflow-y-auto"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm z-0 fixed"></div>

      <Button asChild variant="outline" size="sm" className="absolute top-6 left-6 shadow-sm z-50 transition-all hover:bg-muted/60">
        <Link to="/dict">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
      </Button>

      <div className="max-w-2xl mx-auto pt-10 sm:pt-6 relative z-10">
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          {/* TODO: Replace logo import at top of file with DICT logo */}
          <img src={logoImage} alt="DICT Logo" className="h-20 sm:h-24 md:h-28 w-auto mb-6 drop-shadow-md object-contain" />
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground drop-shadow-sm">Visitor Registration</h1>
          <p className="text-muted-foreground mt-2 font-medium">DICT Provincial Office Bukidnon</p>
        </div>

        <Card className="animate-fade-in shadow-2xl bg-card/95 backdrop-blur-md border-border/50 rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
            <CardTitle className="font-heading text-xl">Visitor Information</CardTitle>
            <CardDescription className="font-medium text-muted-foreground/80">All fields marked * are required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="dict_full_name">Full Name *</Label>
                <Input id="dict_full_name" placeholder="Juan Dela Cruz" {...register("full_name")} />
                {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dict_age">Age *</Label>
                  <Input id="dict_age" type="number" placeholder="25" {...register("age")} />
                  {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select onValueChange={(v) => setValue("gender", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
                </div>
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label>Industry / Sector *</Label>
                <Select onValueChange={(v) => {
                  setValue("industry", v as Industry);
                  if (v === "marginalized") {
                    setValue("industry_detail", undefined);
                    setValue("industry_location", undefined);
                    setValue("academe_type", undefined);
                    setValue("government_position", undefined);
                  } else {
                    setValue("marginalized_type", undefined);
                    if (v !== "academe") setValue("academe_type", undefined);
                    if (v !== "government") setValue("government_position", undefined);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(industryLabels) as Industry[]).map((key) => (
                      <SelectItem key={key} value={key}>{industryLabels[key]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && <p className="text-sm text-destructive">{errors.industry.message}</p>}
              </div>

              {/* Academe Type */}
              {selectedIndustry === "academe" && (
                <div className="space-y-2 animate-fade-in">
                  <Label>Role *</Label>
                  <Select onValueChange={(v) => setValue("academe_type", v as "student" | "instructor" | "non_teaching_staff")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="non_teaching_staff">Non-Teaching Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.academe_type && <p className="text-sm text-destructive">{errors.academe_type.message}</p>}
                </div>
              )}

              {/* Government Position */}
              {selectedIndustry === "government" && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="dict_government_position">Position *</Label>
                  <Input id="dict_government_position" placeholder="e.g. Department Head, Staff" {...register("government_position")} />
                  {errors.government_position && <p className="text-sm text-destructive">{errors.government_position.message}</p>}
                </div>
              )}

              {/* Industry Detail */}
              {selectedIndustry && selectedIndustry !== "marginalized" && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="dict_industry_detail">
                    {selectedIndustry === "academe" ? "School Name *" :
                      selectedIndustry === "government" ? "Office Name *" :
                        selectedIndustry === "private_sector" ? "Company / Freelancer *" :
                          "Business Name *"}
                  </Label>
                  <Input id="dict_industry_detail" placeholder={industryDetailPlaceholders[selectedIndustry]} {...register("industry_detail")} />
                  {errors.industry_detail && <p className="text-sm text-destructive">{errors.industry_detail.message}</p>}
                </div>
              )}

              {/* Industry Location */}
              {(selectedIndustry === "private_sector" || selectedIndustry === "msme") && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="dict_industry_location">Location</Label>
                  <Input id="dict_industry_location" placeholder={industryLocationPlaceholders[selectedIndustry]} {...register("industry_location")} />
                </div>
              )}

              {/* Marginalized Type */}
              {selectedIndustry === "marginalized" && (
                <div className="space-y-2 animate-fade-in">
                  <Label>Category *</Label>
                  <Select onValueChange={(v) => setValue("marginalized_type", v as MarginalizedType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(marginalizedLabels) as MarginalizedType[]).map((key) => (
                        <SelectItem key={key} value={key}>{marginalizedLabels[key]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.marginalized_type && <p className="text-sm text-destructive">{errors.marginalized_type.message}</p>}
                </div>
              )}

              {/* Purpose */}
              <div className="space-y-2">
                <Label>Facility to Use *</Label>
                <Select onValueChange={(v) => setValue("purpose", v as Purpose)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(purposeLabels) as Purpose[]).map((key) => (
                      <SelectItem key={key} value={key}>{purposeLabels[key]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.purpose && <p className="text-sm text-destructive">{errors.purpose.message}</p>}
              </div>

              {/* Purpose Detail */}
              {selectedPurpose === "others" && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="dict_purpose_detail">Please specify *</Label>
                  <Input id="dict_purpose_detail" placeholder="Specify your purpose" {...register("purpose_detail")} />
                </div>
              )}

              {/* Date & Time (display only) */}
              <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                Date & Time: <span className="font-medium text-foreground">{new Date().toLocaleString()}</span> (auto-generated)
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Registration"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DictVisitorForm;
