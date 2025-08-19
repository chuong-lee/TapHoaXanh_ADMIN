import { Option } from "@/components/form/Select";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleLoadSelectOptions<T>(
  data: T[] | null,
  valueKey: keyof T,
  labelKey: keyof T
): Option[] {
  return (data ?? [])
    .filter((item) => item[valueKey] != null)
    .map((item) => ({
      value: String(item[valueKey]),
      label: String(item[labelKey] ?? ""),
    }));
}

// utils/cookie.ts
export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

export function setCookie(name: string, value: string, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}
