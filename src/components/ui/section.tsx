import { cn } from "@/lib/utils";
import React from "react";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  container?: boolean;
  dense?: boolean; // Less vertical padding
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, children, container = true, dense = false, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          "w-full relative",
          dense ? "py-12 md:py-16" : "py-16 md:py-24",
          className
        )}
        {...props}
      >
        {container ? (
          <div className="container mx-auto px-4 md:px-6 max-w-6xl h-full">
            {children}
          </div>
        ) : (
          children
        )}
      </section>
    );
  }
);
Section.displayName = "Section";

export { Section };