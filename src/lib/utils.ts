import { Option } from "@/components/form/Select";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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