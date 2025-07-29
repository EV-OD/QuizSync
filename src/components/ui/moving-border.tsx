"use client";

import React, { ElementType, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";

export function MovingButton({
  as: Component = "button",
  duration = 2000,
  className,
  children,
  ...otherProps
}: {
  as?: ElementType;
  duration?: number;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <Component
      className={cn(
        "bg-transparent relative h-12 text-xl p-[1px] overflow-hidden ",
        className
      )}
      {...otherProps}
    >
      <div className="absolute inset-0">
        <BorderBeam size={250} duration={12} delay={9} />
      </div>

      <div className="relative bg-background text-foreground w-full h-full flex items-center justify-center">
        {children}
      </div>
    </Component>
  );
}

export const BorderBeam = ({
  className,
  size = 200,
  duration = 15,
  delay = 0,
}: {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
}) => {
  const anle = 180;
  return (
    <div
      style={
        {
          "--size": size,
          "--duration": duration,
          "--angle": `${anle}deg`,
          "--delay": `-${delay}s`,
        } as React.CSSProperties
      }
      className={cn(
        "absolute inset-0 flex items-center justify-center overflow-hidden",
        " [border-image:linear-gradient(to_right,transparent,hsl(var(--primary)),transparent)_1]",
        className
      )}
    >
      <div
        className={cn(
          "aspect-square h-full w-full",
          "animate-border-beam [animation-delay:var(--delay)] [background:linear-gradient(to_left,var(--tw-gradient-stops))] [background-size:var(--size)_100%]"
        )}
      />
    </div>
  );
};
