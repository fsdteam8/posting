"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SuccessCardProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  primaryColor?: string;
}

export default function SuccessCard({
  title = "Password updated",
  description = "Your password has been changed successfully. You can now log in with your new password.",
  buttonText = "Back to login",
  buttonHref = "/login",
  onButtonClick,
  primaryColor = "#1fa0f3",
}: SuccessCardProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center px-5 py-5">
      <div className="mb-8">
        <div
          className="relative size-10 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: "rgba(31,160,243,0.10)",
          }}
        >
          <div
            className={[
              "absolute inset-0 rounded-full",
              animate ? "animate-ping" : "",
            ].join(" ")}
            style={{
              backgroundColor: "rgba(31,160,243,0.12)",
            }}
          />

          <svg
            className="relative size-12"
            viewBox="0 0 52 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="26"
              cy="26"
              r="22"
              stroke={primaryColor}
              strokeWidth="3"
              className={[
                "transition-all duration-700",
                animate ? "opacity-100" : "opacity-0",
              ].join(" ")}
              style={{
                strokeDasharray: 140,
                strokeDashoffset: animate ? 0 : 140,
                transitionProperty: "stroke-dashoffset, opacity",
              }}
            />
            <path
              d="M16 26.5L22.5 33L36.5 19"
              stroke={primaryColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={[
                "transition-all duration-700",
                animate ? "opacity-100" : "opacity-0",
              ].join(" ")}
              style={{
                strokeDasharray: 60,
                strokeDashoffset: animate ? 0 : 60,
                transitionProperty: "stroke-dashoffset, opacity",
                transitionDelay: "150ms",
              }}
            />
          </svg>
        </div>
      </div>

      <h1 className="text-xl font-semibold text-center text-foreground mb-2 text-balance">
        {title}
      </h1>

      <p className="text-sm text-center text-muted-foreground leading-relaxed mb-8">
        {description}
      </p>

      {buttonHref ? (
        <Link href={buttonHref} className="w-full">
          <Button className="w-full rounded-full">{buttonText}</Button>
        </Link>
      ) : (
        <Button
          onClick={onButtonClick}
          className="w-full h-11 rounded-full text-sm font-medium"
          style={{ backgroundColor: primaryColor }}
        >
          {buttonText}
        </Button>
      )}

      <p className="text-xs text-muted-foreground mt-6 text-center">
        You can safely close this page after logging in.
      </p>
    </div>
  );
}
