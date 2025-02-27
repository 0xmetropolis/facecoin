"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type MenuOption = {
  label: string;
  type: "button";
  link: string;
};

const MENU_OPTIONS: MenuOption[] = [
  {
    label: "BOOTH TERMINAL",
    type: "button",
    link: "/admin/booth",
  },
  {
    label: "DISTRIBUTION DASHBOARD",
    type: "button",
    link: "/admin/distribution-dashboard",
  },
  {
    label: "REPLICATE PARAMS",
    type: "button",
    link: "/admin/replicate-params",
  },
  {
    label: "LIQUIDITY PARAMETERS",
    type: "button",
    link: "/admin/liquidity-params",
  },
  {
    label: "RESET USER",
    type: "button",
    link: "/admin/reset-user",
  },
];

const useMousePosition = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate position relative to window center
      const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;
      setPosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return position;
};

export function AdminDashboard() {
  const mousePosition = useMousePosition();
  const searchParams = useSearchParams();
  const router = useRouter();
  const success = searchParams.get("success");

  // Add useEffect for initial focus
  useEffect(() => {
    if (success) {
      const audio = new Audio("/login-sound.mp3");
      audio.volume = 0.5;
      audio.play();
      router.replace("/admin");
    }
    // Focus the first menu item on component mount
    const firstMenuItem =
      document.querySelector<HTMLAnchorElement>('[role="menuitem"]');
    firstMenuItem?.focus();
  }, [router, success]);

  // Add keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent, currentIndex: number) => {
    const menuItems =
      document.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]');

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % menuItems.length;
        menuItems[nextIndex]?.focus();
        break;
      case "ArrowUp":
        event.preventDefault();
        const prevIndex =
          currentIndex - 1 < 0 ? menuItems.length - 1 : currentIndex - 1;
        menuItems[prevIndex]?.focus();
        break;
    }
  };

  const transformStyle = {
    transform: `
      perspective(1000px)
      rotateX(${mousePosition.y * 1}deg)
      rotateY(${mousePosition.x * 1}deg)
      translateX(${mousePosition.x * 10}px)
      translateY(${mousePosition.y * 10}px)
    `,
  };

  return (
    <div
      className="flex-1 transition-transform duration-200 ease-out"
      style={transformStyle}
    >
      {/* Update orb transform for more pronounced effect */}
      <div
        className="relative w-48 h-48 mb-12 ml-[-20px] xbox-orb"
        style={{
          transform: `
            perspective(1000px)
            rotateX(${mousePosition.y * 2}deg)
            rotateY(${mousePosition.x * 2}deg)
            translateX(${mousePosition.x * 15}px)
            translateY(${mousePosition.y * 15}px)
          `,
        }}
      >
        {/* Outer glow */}
        <div className="absolute -inset-12 bg-[#85C441] rounded-full blur-[100px] opacity-[0.05]" />

        {/* Inner glow */}
        <div className="absolute inset-0 bg-[#85C441] rounded-full blur-[50px] opacity-20 animate-pulse" />

        {/* Orb content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-24 h-24">
            {/* Orb background with shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#107C10] to-[#085808] rounded-full border-4 border-[#85C441]/50 overflow-hidden">
              <div className="absolute -inset-full rotate-45 translate-y-full animate-[shine_3s_ease-in-out_infinite]">
                <div className="w-full h-full bg-gradient-to-t from-transparent via-[#85C441]/10 to-transparent" />
              </div>
            </div>

            {/* X logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl text-white font-bold drop-shadow-[0_0_8px_rgba(133,196,65,0.5)]">
                X
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Updated menu items */}
      <nav className="space-y-3" role="navigation" aria-label="Admin menu">
        {MENU_OPTIONS.map((option, index) => (
          <Link
            key={index}
            href={option.link}
            className={cn(
              "group relative pl-12 py-2 block focus-visible:outline-none",
              "opacity-60 hover:opacity-100 focus-visible:opacity-100",
              "transition-all duration-200"
            )}
            role="menuitem"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {/* Selection indicator */}
            <div
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2",
                "w-8 h-8 rounded-full",
                "group-hover:bg-[#85C441]/20 group-focus-visible:bg-[#85C441]/20",
                "transition-all duration-200"
              )}
            >
              <div
                className={cn(
                  "absolute inset-2 rounded-full",
                  "bg-[#85C441]/30",
                  "group-hover:bg-[#85C441] group-focus-visible:bg-[#85C441]"
                )}
              />
            </div>

            <div
              className={cn(
                "relative w-full h-12 px-4",
                "group-hover:opacity-100 group-focus-visible:opacity-100",
                "transition-all duration-200"
              )}
            >
              {/* Button background with glow */}
              <div
                className={cn(
                  "absolute inset-0 bg-[#85C441]/10",
                  "group-hover:bg-[#85C441]/20 group-focus-visible:bg-[#85C441]/20",
                  "transition-colors duration-200"
                )}
              >
                {/* Animated gradient overlay */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                    "transition-opacity duration-300",
                    "bg-gradient-to-r from-transparent via-[#85C441]/10 to-transparent"
                  )}
                />
              </div>

              {/* Content */}
              <div className="relative flex items-center justify-between h-full">
                <span className="text-white font-bold tracking-wider ">
                  {option.label}
                </span>

                {/* Right arrow indicator */}
                <div className="w-6 h-6 flex items-center justify-center opacity-50 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 fill-current text-[#85C441]"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </div>

              {/* Bottom highlight */}
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-0.5",
                  "bg-[#85C441] opacity-30",
                  "group-hover:opacity-100 group-focus-visible:opacity-100",
                  "transition-opacity duration-200"
                )}
              />
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}
