"use client";

import { useRef } from "react";

type Props = {
  html: string;
  className?: string;
  tag?: "div" | "span";
};

export default function ScratchContent({
  html,
  className,
  tag = "div",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  if (tag === "span") {
    return (
      <span
        ref={ref}
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
