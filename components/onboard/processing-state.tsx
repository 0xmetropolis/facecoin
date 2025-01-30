import { Loader2 } from "lucide-react";

export function ProcessingState() {
  return (
    <div className="max-w-md mx-auto">
      <div className="aspect-square bg-white rounded-sm shadow-sm overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">
            processing your face...
          </p>
        </div>
      </div>
    </div>
  );
}
