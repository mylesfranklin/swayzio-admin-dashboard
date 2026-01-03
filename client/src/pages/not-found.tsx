import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-base">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4 gap-3">
            <div className="p-2 rounded-md bg-linear-error/20">
              <AlertCircle className="h-6 w-6 text-linear-error" />
            </div>
            <h1 className="text-xl font-semibold text-white">404 Page Not Found</h1>
          </div>

          <p className="text-sm text-linear-text-secondary">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <Link href="/">
            <Button className="mt-6" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
