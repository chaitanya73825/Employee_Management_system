import React from "react";
import { cn } from "../../lib/utils";
import { motion, HTMLMotionProps } from "motion/react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  className?: string;
  glow?: boolean;
  blur?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glow = false, blur = "md", children, ...props }, ref) => {
    const blurClasses = {
      sm: "backdrop-blur-sm",
      md: "backdrop-blur-md",
      lg: "backdrop-blur-lg",
      xl: "backdrop-blur-xl",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "bg-white/70 border border-slate-200/80 rounded-2xl shadow-sm",
          blurClasses[blur],
          glow && "shadow-[0_0_15px_rgba(59,130,246,0.12)] hover:shadow-[0_0_25px_rgba(59,130,246,0.2)] transition-shadow duration-300",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";
