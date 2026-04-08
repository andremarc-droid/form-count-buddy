// TODO: Replace these imports with actual DICT assets when available
// Drop your files into src/assets/ as DICTlogo.png and DICT.jpg, then update these imports
import bgImage from "@/assets/DICT-background.jpg";
import logoImage from "@/assets/DICT-Malaybalay.png";

import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, LogOut, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const DictIndex = () => {
  const [showThankYou, setShowThankYou] = useState(false);

  // Force light mode on visitor-facing pages
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
  }, []);

  const handleExit = () => {
    window.location.href = "about:blank";
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm z-0"></div>

      <div className="text-center max-w-2xl w-full bg-card/95 p-6 sm:p-12 rounded-3xl shadow-2xl z-10 animate-fade-in border border-border/50 backdrop-blur-md">
        <div className="flex flex-col items-center mb-6">
          {/* TODO: Replace logo import at top of file with DICT logo */}
          <img src={logoImage} alt="DICT Provincial Office Logo" className="h-20 sm:h-24 md:h-28 w-auto mb-6 drop-shadow-md object-contain" />
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-heading font-extrabold text-foreground tracking-tight mb-2">
            Foot Traffic Monitor
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium mb-6 sm:mb-8">
            DICT Provincial Office Bukidnon
          </p>
        </div>

        {!showThankYou ? (
          <>
            <div className="bg-primary/5 p-5 sm:p-8 rounded-2xl mb-8 border border-primary/10 relative overflow-hidden text-left shadow-inner">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/60 rounded-l-2xl"></div>
              <p className="text-sm sm:text-base md:text-lg text-foreground/90 leading-relaxed italic font-medium">
                "Kini nga aplikasyon nagsilbi isip monitoring system alang sa mga indibidwal nga mobisita sa maong opisina. Kami magahangyo sa inyong pagtugot sa paghatag sa inyong personal nga impormasyon para sa monitoring ug record-keeping nga katuyoan, kung komportable kamo sa pagbuhat niini."
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full">
              <Button asChild size="lg" className="w-full sm:flex-1 text-sm sm:text-base h-12 sm:h-14 px-4 sm:px-8 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-1">
                <Link to="/dict/visitor-form">
                  <CheckCircle className="h-5 w-5 mr-2 shrink-0" />
                  Mutugot Ko
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="w-full sm:flex-1 text-sm sm:text-base h-12 sm:h-14 px-4 sm:px-8 rounded-full shadow-sm transition-all duration-300 hover:-translate-y-1 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-transparent"
                onClick={() => setShowThankYou(true)}
              >
                <XCircle className="h-5 w-5 mr-2 shrink-0" />
                Dili Ko Mutugot
              </Button>
            </div>
          </>
        ) : (
          <div className="animate-fade-in w-full flex flex-col items-center">
            <div className="bg-muted/30 p-6 sm:p-8 rounded-2xl mb-8 border border-border/50 w-full">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Thank You</h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-2">
                We respect your decision not to provide personal information.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground">
                You can safely exit this page or go back if you change your mind.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-md">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:flex-1 text-sm sm:text-base h-12 sm:h-14 px-4 sm:px-8 rounded-full shadow-sm hover:bg-muted/50 text-foreground hover:text-foreground transition-all duration-300 hover:-translate-y-1"
                onClick={() => setShowThankYou(false)}
              >
                <ArrowLeft className="h-5 w-5 mr-2 shrink-0" />
                Go Back
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="w-full sm:flex-1 text-sm sm:text-base h-12 sm:h-14 px-4 sm:px-8 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-1"
                onClick={handleExit}
              >
                <LogOut className="h-5 w-5 mr-2 shrink-0" />
                Exit
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DictIndex;
