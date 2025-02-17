"use client";

import { useEffect, useRef, useState } from "react";
import "./admin.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Smooth mouse movement with animation frame
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      setPosition((prev) => ({
        x: prev.x + (targetPosition.x - prev.x) * 0.1,
        y: prev.y + (targetPosition.y - prev.y) * 0.1,
      }));
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetPosition]);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !isHovering) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      setTargetPosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [containerRef, isHovering]);

  return (
    <div className="fixed inset-0 bg-[#002000] overflow-hidden b">
      <div className="absolute inset-0 bg-gradient-to-br from-[#002000] via-[#003300] to-[#004400]" />

      <div
        ref={containerRef}
        className="absolute inset-0"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setTargetPosition({ x: 0, y: 0 });
        }}
      >
        {/* Background container with perspective */}
        <div
          className="absolute inset-0 parallax-container"
          style={{
            perspective: "1000px",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Main background layer */}
          <div
            className="absolute inset-0 parallax-layer"
            style={{
              transform: `
                scale(1.1)
                rotateX(${position.y * 10}deg)
                rotateY(${-position.x * 10}deg)
                translateX(${-position.x * 50}px)
                translateY(${-position.y * 50}px)
              `,
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: `url('/admin-background.png')`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                filter: "blur(0.5px)",
              }}
            />
          </div>

          {/* Secondary background layer for depth */}
          <div
            className="absolute inset-0 parallax-layer"
            style={{
              transform: `
                scale(1.2)
                translateZ(-20px)
                rotateX(${position.y * 15}deg)
                rotateY(${-position.x * 15}deg)
                translateX(${-position.x * 75}px)
                translateY(${-position.y * 75}px)
              `,
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: `url('/admin-background.png')`,
                backgroundSize: "120% 120%",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>

          {/* Foreground layer for additional depth */}
          <div
            className="absolute inset-0 parallax-layer"
            style={{
              transform: `
                scale(1.05)
                translateZ(20px)
                rotateX(${position.y * 5}deg)
                rotateY(${-position.x * 5}deg)
                translateX(${-position.x * 25}px)
                translateY(${-position.y * 25}px)
              `,
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `url('/admin-background.png')`,
                backgroundSize: "90% 90%",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full h-full overflow-auto">
        <div className="min-h-full w-full max-w-4xl mx-auto py-8 px-6 flex flex-col justify-center pb-40">
          {children}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-[#001000] to-transparent pointer-events-none z-20" />
    </div>
  );
}
