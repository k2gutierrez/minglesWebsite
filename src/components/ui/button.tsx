"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils"; // Asumiendo que tienes una función 'cn' (clsx + tailwind-merge)

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "link";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-full font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-primary text-white hover:bg-primary-dark",
      secondary: "bg-dark text-white hover:bg-dark/90",
      outline: "border-2 border-primary text-primary hover:bg-primary/10",
      link: "text-primary underline-offset-4 hover:underline p-0 h-auto font-semibold",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-base",
      lg: "h-14 px-8 text-lg",
    };

    // Override size for link variant
    const sizeStyle = variant === 'link' ? '' : sizes[size];

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={variant !== 'link' ? { scale: 1.02 } : {}}
        className={cn(baseStyles, variants[variant], sizeStyle, className)}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button };