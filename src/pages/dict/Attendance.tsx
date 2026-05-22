import bgImage from "@/assets/DICTbg.jpg";
import logoImage from "@/assets/DICT-Malaybalay.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dictDb } from "@/lib/firebase-dict";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
  updateDoc,
  addDoc
} from "firebase/firestore";
import { toast } from "sonner";


const attendanceSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

const Attendance = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successType, setSuccessType] = useState<"in" | "out" | "completed" | null>(null);
  const navigate = useNavigate();

  // Force light mode
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
  }, []);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
  });

  const onSubmit = async (data: AttendanceFormData) => {
    setIsSubmitting(true);
    setSubmitted(false);

    try {
      const originalName = data.fullName;
      const normalizedName = originalName.toLowerCase();
      const todayDateString = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });

      // --- MISSED OUT LOGIC ---
      // Check for any previous incomplete records
      const missedOutQuery = query(
        collection(dictDb, "dict_attendance"),
        where("fullNameLower", "==", normalizedName),
        where("date", "!=", todayDateString),
        where("status", "==", "in"),
        where("timeOut", "==", null),
        where("missedOut", "==", false)
      );

      const missedOutSnapshot = await getDocs(missedOutQuery);
      const updatePromises = missedOutSnapshot.docs.map(docRef =>
        updateDoc(doc(dictDb, "dict_attendance", docRef.id), { missedOut: true })
      );
      await Promise.all(updatePromises);

      // --- ATTENDANCE LOGIC ---
      // Query for today's record
      const todayQuery = query(
        collection(dictDb, "dict_attendance"),
        where("fullNameLower", "==", normalizedName),
        where("date", "==", todayDateString)
      );

      const todaySnapshot = await getDocs(todayQuery);

      if (todaySnapshot.empty) {
        // CASE A: Log In
        await addDoc(collection(dictDb, "dict_attendance"), {
          fullName: originalName,
          fullNameLower: normalizedName,
          date: todayDateString,
          timeIn: Timestamp.now(),
          timeOut: null,
          status: "in",
          missedOut: false,
          createdAt: serverTimestamp(),
        });
        setSuccessType("in");
        setSubmitted(true);
        reset();
      } else {
        const record = todaySnapshot.docs[0];
        const recordData = record.data();

        if (recordData.status === "in" && recordData.timeOut === null) {
          // CASE B: Log Out
          await updateDoc(doc(dictDb, "dict_attendance", record.id), {
            timeOut: Timestamp.now(),
            status: "out"
          });
          setSuccessType("out");
          setSubmitted(true);
          reset();
        } else if (recordData.status === "out") {
          // CASE C: Already Completed
          setSuccessType("completed");
          setSubmitted(true);
        }
      }
    } catch (error) {
      console.error("Error processing attendance: ", error);
      toast.error("Adunay sayop. Palihug sulayi pag-usab.");
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
        <Card className="w-full max-w-md text-center animate-fade-in shadow-2xl z-10 bg-card/95 border-border/50 backdrop-blur-md rounded-3xl">
          <CardContent className="pt-10 pb-10">
            <CheckCircle2 className="mx-auto h-16 w-16 text-primary mb-4" />
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              {successType === "completed" ? "Attendance Completed" : "Success!"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {successType === "in" && "Naitala na ang imong ngalan. Naka-login ka na karong adlawa."}
              {successType === "out" && "Naitala na ang imong pag-logout. Salamat ug ingon ana!"}
              {successType === "completed" && "Nakumpleto na ang imong attendance karong adlawa. Balik ugma!"}
            </p>
            <Button
              onClick={() => {
                setSubmitted(false);
                setSuccessType(null);
              }}
              className="w-full shadow-md h-12 rounded-full transition-all duration-300 hover:-translate-y-1"
            >
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

      <div className="max-w-2xl mx-auto pt-10 sm:pt-6 relative z-10">
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <img src={logoImage} alt="DICT Logo" className="h-20 sm:h-24 md:h-28 w-auto mb-6 drop-shadow-md object-contain" />
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground drop-shadow-sm">Attendance</h1>
          <p className="text-muted-foreground mt-2 font-medium">DICT Provincial Office Bukidnon</p>
        </div>

        <Card className="animate-fade-in shadow-2xl bg-card/95 backdrop-blur-md border-border/50 rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
            <CardTitle className="font-heading text-xl">Attendance Log</CardTitle>
            <CardDescription className="font-medium text-muted-foreground/80">Please enter your name to log in or out</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input id="fullName" {...register("fullName")} />
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
              </div>

              <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                Date & Time: <span className="font-medium text-foreground">{new Date().toLocaleString()}</span> (auto-generated)
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Submit Attendance"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Attendance;
