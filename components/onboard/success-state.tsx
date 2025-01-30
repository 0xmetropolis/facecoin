import { Button } from "@/components/shadcn/button";

export function SuccessState({ amount = "10,000" }: { amount?: string }) {
  return (
    <div className="max-w-md mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">
          Congrats Facecoin Terminal Has Given You:
        </h2>
        <p className="text-2xl font-bold">{amount} Facecoin</p>
      </div>

      <div className="aspect-square bg-white rounded-sm shadow-sm overflow-hidden">
        <div className="w-full h-full bg-muted/20 flex items-center justify-center">
          <p className="text-muted-foreground">AI Stylized Image</p>
        </div>
      </div>

      <div className="space-y-2 text-center">
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          asChild
        >
          <a
            href="https://twitter.com/intent/tweet"
            target="_blank"
            rel="noopener noreferrer"
          >
            Share on Twitter!
          </a>
        </Button>
        <p className="text-sm text-muted-foreground">Farcaster For 2x bonus</p>
      </div>
    </div>
  );
}
