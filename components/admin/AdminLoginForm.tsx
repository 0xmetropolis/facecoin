"use client";

import { adminLoginAction } from "@/actions/adminLogin";
import { useActionState, useEffect, useState } from "react";

type MenuOption = {
  id: number;
  label: string;
  type: "input" | "button";
};

const MENU_OPTIONS: MenuOption[] = [
  { id: 0, label: "ENTER PASSWORD", type: "input" },
  { id: 1, label: "SIGN IN", type: "button" },
];

function SubmitButton({
  isPending,
  isSelected,
}: {
  isPending: boolean;
  isSelected: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className={`
        group relative w-full h-12 px-4 text-left
        ${isSelected ? "opacity-100" : "opacity-60"}
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-all duration-200
      `}
    >
      {/* Button background with glow */}
      <div
        className={`
        absolute inset-0 bg-[#85C441]/10
        ${isSelected ? "bg-[#85C441]/20" : ""}
        transition-colors duration-200
      `}
      >
        {/* Animated gradient overlay */}
        <div
          className="
          absolute inset-0 opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          bg-gradient-to-r from-transparent via-[#85C441]/10 to-transparent
        "
        />
      </div>

      {/* Button content */}
      <div className="relative flex items-center justify-between">
        <span className="text-white font-bold tracking-wider">
          {isPending ? "SIGNING IN..." : "SIGN IN"}
        </span>

        {/* Right arrow indicator */}
        <div
          className={`
          w-6 h-6 flex items-center justify-center
          ${isSelected ? "opacity-100" : "opacity-50"}
        `}
        >
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
        className={`
        absolute bottom-0 left-0 right-0 h-0.5
        bg-[#85C441]
        ${isSelected ? "opacity-100" : "opacity-30"}
        transition-opacity duration-200
      `}
      />
    </button>
  );
}

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

export function AdminLoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const mousePosition = useMousePosition();
  const [selectedOption, setSelectedOption] = useState<number>(0);
  const [password, setPassword] = useState<string>("");
  const [state, formAction, isPending] = useActionState<
    { error: string | null },
    FormData
  >(adminLoginAction, { error: null });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          setSelectedOption((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "ArrowDown":
          setSelectedOption((prev) =>
            prev < MENU_OPTIONS.length - 1 ? prev + 1 : prev
          );
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update transform calculations for subtle movement
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
          <div className="relative w-32 h-32">
            {/* Orb background with shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#107C10] to-[#085808] rounded-full border-4 border-[#85C441]/50 overflow-hidden">
              <div className="absolute -inset-full rotate-45 translate-y-full animate-[shine_3s_ease-in-out_infinite]">
                <div className="w-full h-full bg-gradient-to-t from-transparent via-[#85C441]/10 to-transparent" />
              </div>
            </div>

            {/* X logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl text-white font-bold drop-shadow-[0_0_8px_rgba(133,196,65,0.5)]">
                X
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        {MENU_OPTIONS.map((option) => (
          <div
            key={option.id}
            className={`
              group relative pl-12 py-2
              ${selectedOption === option.id ? "opacity-100" : "opacity-60"}
              transition-all duration-200
            `}
          >
            {/* Selection indicator */}
            <div
              className={`
              absolute left-0 top-1/2 -translate-y-1/2
              w-8 h-8 rounded-full
              ${
                selectedOption === option.id
                  ? "bg-[#85C441]/20"
                  : "bg-transparent"
              }
              transition-all duration-200
            `}
            >
              <div
                className={`
                absolute inset-2 rounded-full
                ${
                  selectedOption === option.id
                    ? "bg-[#85C441]"
                    : "bg-[#85C441]/30"
                }
              `}
              />
            </div>

            {/* Menu item content */}
            {option.type === "input" ? (
              <div className="relative h-12">
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setSelectedOption(option.id)}
                  disabled={isPending}
                  className={`
                    w-full h-full bg-[#85C441]/10 px-4 text-white font-bold
                    ${selectedOption === option.id ? "bg-[#85C441]/20" : ""}
                    transition-colors duration-200
                    focus:outline-none placeholder:text-[#85C441]/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  placeholder={option.label}
                />
                {/* Bottom highlight */}
                <div
                  className={`
                  absolute bottom-0 left-0 right-0 h-0.5
                  bg-[#85C441]
                  ${selectedOption === option.id ? "opacity-100" : "opacity-30"}
                  transition-opacity duration-200
                `}
                />
              </div>
            ) : (
              <SubmitButton
                isPending={isPending}
                isSelected={selectedOption === option.id}
              />
            )}
          </div>
        ))}

        {/* Error message */}
        {state?.error && (
          <div className="mt-6 text-[#FF4444] font-bold pl-12">
            {state.error}
          </div>
        )}
      </form>
    </div>
  );
}
