import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const colors = {
  primary: '#1351B4', // Azul principal do Governo de SP
  secondary: '#FFFFFF',
  background: '#F5F6F7',
  text: '#1C1C1C',
  border: '#E5E5E5',
} 