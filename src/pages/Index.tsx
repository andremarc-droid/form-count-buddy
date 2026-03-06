import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, BarChart3, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="text-center max-w-lg animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <BarChart3 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-heading font-bold text-foreground mb-3">
          Foot Traffic Monitor
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Digital visitor registration and analytics system
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link to="/visitor-form">
              <Users className="h-5 w-5 mr-2" />
              Visitor Registration
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/admin/login">
              <Shield className="h-5 w-5 mr-2" />
              Admin Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
