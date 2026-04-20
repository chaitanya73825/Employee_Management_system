import React from "react";
import { cn } from "../../lib/utils";
import { motion, HTMLMotionProps } from "motion/react";

interface GlowButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "accent" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles = "relative overflow-hidden rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white";
    
    const variants = {
      primary: "bg-blue-500 text-white border border-blue-500 hover:bg-blue-600 hover:shadow-[0_4px_20px_rgba(59,130,246,0.35)] focus-visible:ring-blue-500",
      accent: "bg-purple-500 text-white border border-purple-500 hover:bg-purple-600 hover:shadow-[0_4px_20px_rgba(168,85,247,0.35)] focus-visible:ring-purple-500",
      danger: "bg-red-500 text-white border border-red-500 hover:bg-red-600 hover:shadow-[0_4px_20px_rgba(239,68,68,0.35)] focus-visible:ring-red-500",
      ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200",
    };

    const sizes = {
      sm: "px-4 py-1.5 text-sm",
      md: "px-6 py-2.5 text-base",
      lg: "px-8 py-3 text-lg",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        {/* Subtle inner glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </motion.button>
    );
  }
);

GlowButton.displayName = "GlowButton";
