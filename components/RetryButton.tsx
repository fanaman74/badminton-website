"use client";

import { useRouter } from "next/navigation";
import type { ButtonHTMLAttributes } from "react";

export function RetryButton({ children = "Try again", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const router = useRouter();
  return <button type="button" onClick={() => router.refresh()} {...props}>{children}</button>;
}
