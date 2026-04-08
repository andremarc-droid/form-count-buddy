import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    type DictVisitorFormData,
    type DictVisitorRow,
    useDictAddVisitor,
    useDictUpdateVisitor,
} from "@/hooks/useDictVisitorData";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const visitorSchema = z.object({
    full_name: z.string().trim().min(1, "Full name is required").max(100),
    age: z.coerce
        .number()
        .int()
        .min(1, "Age must be at least 1")
        .max(149, "Invalid age"),
    gender: z.string().min(1, "Gender is required"),
    industry: z.enum([
        "academe",
        "government",
        "private_sector",
        "msme",
        "marginalized",
    ] as const),
    industry_detail: z.string().max(200).optional().nullable(),
    industry_location: z.string().max(200).optional().nullable(),
    marginalized_type: z
        .enum(["pwd", "unemployed", "senior"] as const)
        .optional()
        .nullable(),
    academe_type: z
        .enum(["student", "instructor", "non_teaching_staff"] as const)
        .optional()
        .nullable(),
    government_position: z.string().max(200).optional().nullable(),
    purpose: z.string().min(1, "Purpose is required").max(200),
});

type FormValues = z.infer<typeof visitorSchema>;

type Industry =
    | "academe"
    | "government"
    | "private_sector"
    | "msme"
    | "marginalized";
type MarginalizedType = "pwd" | "unemployed" | "senior";


const industryLabels: Record<Industry, string> = {
    academe: "Academe",
    government: "Government",
    private_sector: "Private Sector",
    msme: "MSME's",
    marginalized: "Marginalized Sector",
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

interface DictVisitorFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    visitor?: DictVisitorRow | null;
}

export function DictVisitorFormDialog({
    open,
    onOpenChange,
    visitor,
}: DictVisitorFormDialogProps) {
    const isEdit = !!visitor;
    const addMutation = useDictAddVisitor();
    const updateMutation = useDictUpdateVisitor();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(visitorSchema),
    });

    const selectedIndustry = watch("industry");


    useEffect(() => {
        if (open && visitor) {
            reset({
                full_name: visitor.full_name,
                age: visitor.age,
                gender: visitor.gender,
                industry: visitor.industry as Industry,
                industry_detail: visitor.industry_detail,
                industry_location: visitor.industry_location,
                marginalized_type: visitor.marginalized_type as MarginalizedType | null,
                academe_type: visitor.academe_type as "student" | "instructor" | "non_teaching_staff" | null,
                government_position: visitor.government_position,
                purpose: visitor.purpose,
            });
        } else if (open) {
            reset({
                full_name: "",
                age: 0,
                gender: "",
                industry: undefined,
                industry_detail: null,
                industry_location: null,
                marginalized_type: null,
                academe_type: null,
                government_position: null,
                purpose: "",
            });
        }
    }, [open, visitor, reset]);

    const onSubmit = async (data: FormValues) => {
        const payload: DictVisitorFormData = {
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
        };

        try {
            if (isEdit && visitor) {
                await updateMutation.mutateAsync({ id: visitor.id, data: payload });
                toast.success("Visitor updated successfully");
            } else {
                await addMutation.mutateAsync(payload);
                toast.success("Visitor added successfully");
            }
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving visitor:", error);
            toast.error("Failed to save visitor. Please try again.");
        }
    };

    const isPending = addMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Visitor" : "Add Visitor"}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update the visitor's information below."
                            : "Fill in the visitor's information below."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="dict_dlg_full_name">Full Name *</Label>
                        <Input
                            id="dict_dlg_full_name"
                            placeholder="Juan Dela Cruz"
                            {...register("full_name")}
                        />
                        {errors.full_name && (
                            <p className="text-sm text-destructive">
                                {errors.full_name.message}
                            </p>
                        )}
                    </div>

                    {/* Age & Gender */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dict_dlg_age">Age *</Label>
                            <Input
                                id="dict_dlg_age"
                                type="number"
                                placeholder="25"
                                {...register("age")}
                            />
                            {errors.age && (
                                <p className="text-sm text-destructive">
                                    {errors.age.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Gender *</Label>
                            <Select
                                value={watch("gender") || ""}
                                onValueChange={(v) => setValue("gender", v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                    <SelectItem value="prefer_not_to_say">
                                        Prefer not to say
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && (
                                <p className="text-sm text-destructive">
                                    {errors.gender.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Industry */}
                    <div className="space-y-2">
                        <Label>Industry / Sector *</Label>
                        <Select
                            value={selectedIndustry || ""}
                            onValueChange={(v) => {
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
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                                {(Object.keys(industryLabels) as Industry[]).map((key) => (
                                    <SelectItem key={key} value={key}>
                                        {industryLabels[key]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.industry && (
                            <p className="text-sm text-destructive">
                                {errors.industry.message}
                            </p>
                        )}
                    </div>

                    {/* Academe Type */}
                    {selectedIndustry === "academe" && (
                        <div className="space-y-2">
                            <Label>Role *</Label>
                            <Select
                                value={watch("academe_type") || ""}
                                onValueChange={(v) =>
                                    setValue("academe_type", v as "student" | "instructor" | "non_teaching_staff")
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="instructor">Instructor</SelectItem>
                                    <SelectItem value="non_teaching_staff">Non-Teaching Staff</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.academe_type && (
                                <p className="text-sm text-destructive">
                                    {errors.academe_type.message}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Government Position */}
                    {selectedIndustry === "government" && (
                        <div className="space-y-2">
                            <Label htmlFor="dict_dlg_government_position">Position *</Label>
                            <Input
                                id="dict_dlg_government_position"
                                placeholder="e.g. Department Head, Staff"
                                {...register("government_position")}
                            />
                            {errors.government_position && (
                                <p className="text-sm text-destructive">
                                    {errors.government_position.message}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Industry Detail */}
                    {selectedIndustry && selectedIndustry !== "marginalized" && (
                        <div className="space-y-2">
                            <Label htmlFor="dict_dlg_industry_detail">
                                {selectedIndustry === "academe"
                                    ? "School Name"
                                    : selectedIndustry === "government"
                                        ? "Office Name"
                                        : selectedIndustry === "private_sector"
                                            ? "Company / Freelancer"
                                            : "Business Name"}
                            </Label>
                            <Input
                                id="dict_dlg_industry_detail"
                                placeholder={industryDetailPlaceholders[selectedIndustry]}
                                {...register("industry_detail")}
                            />
                            {errors.industry_detail && (
                                <p className="text-sm text-destructive">
                                    {errors.industry_detail.message}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Industry Location */}
                    {(selectedIndustry === "private_sector" ||
                        selectedIndustry === "msme") && (
                            <div className="space-y-2">
                                <Label htmlFor="dict_dlg_industry_location">Location</Label>
                                <Input
                                    id="dict_dlg_industry_location"
                                    placeholder="Location (e.g., Cebu City)"
                                    {...register("industry_location")}
                                />
                            </div>
                        )}

                    {/* Marginalized Type */}
                    {selectedIndustry === "marginalized" && (
                        <div className="space-y-2">
                            <Label>Category *</Label>
                            <Select
                                value={watch("marginalized_type") || ""}
                                onValueChange={(v) =>
                                    setValue("marginalized_type", v as MarginalizedType)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(
                                        Object.keys(marginalizedLabels) as MarginalizedType[]
                                    ).map((key) => (
                                        <SelectItem key={key} value={key}>
                                            {marginalizedLabels[key]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Purpose */}
                    <div className="space-y-2">
                        <Label htmlFor="dict_dlg_purpose">Purpose *</Label>
                        <Input
                            id="dict_dlg_purpose"
                            placeholder="e.g., Meeting, Training, Inquiry"
                            {...register("purpose")}
                        />
                        {errors.purpose && (
                            <p className="text-sm text-destructive">
                                {errors.purpose.message}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending
                                ? "Saving..."
                                : isEdit
                                    ? "Save Changes"
                                    : "Add Visitor"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
