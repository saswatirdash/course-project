import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getISTTime(): Date {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000; // IST is UTC + 5:30
  return new Date(now.getTime() + offset);
}

export function isAfter1AMIST(): boolean {
  const istNow = getISTTime();
  return istNow.getHours() >= 1;
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function formatXP(amount: number): { label: string; colorClass: string } {
  const isPositive = amount >= 0;
  return {
    label: `${isPositive ? "+" : ""}${amount} XP`,
    colorClass: isPositive ? "text-green-400" : "text-red-400",
  };
}
