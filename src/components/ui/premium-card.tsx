import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface PremiumCardProps extends HTMLMotionProps<"div"> {
  index?: number;
  glass?: boolean;
  glow?: boolean;
}

/**
 * Premium animated card with subtle entrance + lift on hover.
 * GPU-friendly: animates transform/opacity only.
 */
export const PremiumCard = forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, index = 0, glass, glow, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.45,
          delay: Math.min(index, 8) * 0.05,
          ease: [0.2, 0, 0, 1],
        }}
        whileHover={{ y: -3 }}
        className={cn(
          "rounded-xl border bg-card text-card-foreground p-5 transition-shadow",
          glass && "glass",
          glow ? "elev-glow" : "elev-2 hover:elev-3",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
PremiumCard.displayName = "PremiumCard";
