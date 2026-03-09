
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatLabel, useVisitorData } from "@/hooks/useVisitorData";
import { useState } from "react";

const AdminVisitors = () => {
  const { data: visitors = [], isLoading } = useVisitorData();
  const [search, setSearch] = useState("");

  const filtered = visitors.filter((v) =>
    v.full_name.toLowerCase().includes(search.toLowerCase()) ||
    v.industry.toLowerCase().includes(search.toLowerCase()) ||
    v.purpose.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Visitors</h1>
        <p className="page-subtitle">View all visitor submissions</p>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search by name, industry, or purpose..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Detail</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No visitors found</TableCell>
              </TableRow>
            ) : (
              filtered.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.full_name}</TableCell>
                  <TableCell>{v.age}</TableCell>
                  <TableCell className="capitalize">{v.gender}</TableCell>
                  <TableCell>{formatLabel(v.industry)}</TableCell>
                  <TableCell>{v.industry_detail || "—"}</TableCell>
                  <TableCell>{formatLabel(v.purpose)}</TableCell>
                  <TableCell>{v.visit_date}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default AdminVisitors;
