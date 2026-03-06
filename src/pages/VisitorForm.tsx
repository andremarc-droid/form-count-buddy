import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Users, CheckCircle2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

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
  purpose: z.enum(["training", "coworking", "conference_room"] as const),
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
  training: "Training",
  coworking: "Co-working",
  conference_room: "Conference Room",
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

const VisitorForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<VisitorFormData>({
    resolver: zodResolver(visitorSchema),
  });

  const selectedIndustry = watch("industry");

  const onSubmit = async (data: VisitorFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("visitors").insert({
        full_name: data.full_name,
        age: data.age,
        gender: data.gender,
        industry: data.industry,
        industry_detail: data.industry_detail || null,
        industry_location: data.industry_location || null,
        marginalized_type: data.marginalized_type || null,
        purpose: data.purpose,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("You have already submitted a form today.");
        } else {
          toast.error("Submission failed. Please try again.");
          console.error(error);
        }
        return;
      }

      setSubmitted(true);
      reset();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center animate-fade-in">
          <CardContent className="pt-10 pb-10">
            <CheckCircle2 className="mx-auto h-16 w-16 text-accent mb-4" />
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">Your visit has been recorded successfully.</p>
            <Button onClick={() => setSubmitted(false)}>Submit Another</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Visitor Registration</h1>
          <p className="text-muted-foreground mt-2">Please fill in your details to register your visit</p>
        </div>

        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="font-heading">Visitor Information</CardTitle>
            <CardDescription>All fields marked are required</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input id="full_name" placeholder="Juan Dela Cruz" {...register("full_name")} />
                {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input id="age" type="number" placeholder="25" {...register("age")} />
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
                <Select onValueChange={(v) => setValue("industry", v as Industry)}>
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

              {/* Industry Detail */}
              {selectedIndustry && selectedIndustry !== "marginalized" && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="industry_detail">
                    {selectedIndustry === "academe" ? "School Name *" :
                     selectedIndustry === "government" ? "Office Name *" :
                     selectedIndustry === "private_sector" ? "Company / Freelancer *" :
                     "Business Name *"}
                  </Label>
                  <Input
                    id="industry_detail"
                    placeholder={industryDetailPlaceholders[selectedIndustry]}
                    {...register("industry_detail")}
                  />
                </div>
              )}

              {/* Industry Location (for private_sector and msme) */}
              {(selectedIndustry === "private_sector" || selectedIndustry === "msme") && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="industry_location">Location</Label>
                  <Input
                    id="industry_location"
                    placeholder={industryLocationPlaceholders[selectedIndustry]}
                    {...register("industry_location")}
                  />
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
                <Label>Purpose of Visit *</Label>
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

export default VisitorForm;
