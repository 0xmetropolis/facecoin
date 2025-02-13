import { AdminBooth } from "@/components/admin/AdminBooth";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AdminBoothPage() {
  return (
    <div className="fixed left-0 top-0 flex items-center justify-center bg-theme-background h-screen w-screen">
      <header className="w-full bg-theme-primary text-primary-foreground py-2 top-0 fixed overscroll-contain">
        <div className={cn("container flex", )}>
          <Link href="/">  
            <h1 className="text-[32px] font-bold w-fit">facecoin terminal</h1>
          </Link>
        </div>
      </header>
      <div className="h-[60px]" />
      <AdminBooth />
    </div>
  );
}
