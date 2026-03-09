export type Industry = "academe" | "government" | "private_sector" | "msme" | "marginalized";
export type Purpose = "training" | "coworking" | "conference_room";
export type MarginalizedType = "pwd" | "unemployed" | "senior";

export interface VisitorRow {
    id: string;
    full_name: string;
    age: number;
    gender: string;
    industry: Industry;
    industry_detail: string | null;
    industry_location: string | null;
    marginalized_type: MarginalizedType | null;
    purpose: Purpose;
    visit_date: string;
    visit_time: string;
    created_at: string;
}
