import React from "react";
import { cn } from "../../lib/utils";

interface GlowInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const GlowInput = React.forwardRef<HTMLInputElement, GlowInputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-300">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400",
            "outline-none transition-all duration-300",
            "focus:border-blue-400 focus:bg-white focus:shadow-[0_0_12px_rgba(59,130,246,0.15)]",
            icon && "pl-11",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

GlowInput.displayName = "GlowInput";
