import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeName(name: string) {
  // Lowercase, remove accents, keep only letters and spaces, replace multiple spaces with single space, trim
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z\s]/g, "") // strip anything that isn't a-z or space (removes punctuation, digits)
    .replace(/\s+/g, " ") // compress multiple spaces
    .trim();
}

export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function isFuzzyMatch(name1: string, name2: string): boolean {
  const n1 = normalizeName(name1);
  const n2 = normalizeName(name2);

  if (!n1 || !n2) return false;
  if (n1 === n2) return true;

  const dist = levenshteinDistance(n1, n2);
  const minLen = Math.min(n1.length, n2.length);
  
  if (minLen > 5 && dist <= 1) return true;
  if (minLen > 8 && dist <= 2) return true;

  const tokens1 = n1.split(" ");
  const tokens2 = n2.split(" ");
  
  if (tokens1.length >= 2 && tokens2.length >= 2) {
    const isSubset = (smaller: string[], larger: string[]) => {
      // First names must perfectly match
      if (smaller[0] !== larger[0]) return false;
      // Last names must perfectly match
      if (smaller[smaller.length - 1] !== larger[larger.length - 1]) return false;
      return smaller.every(t => larger.includes(t));
    };
    
    if (tokens1.length < tokens2.length && isSubset(tokens1, tokens2)) return true;
    if (tokens2.length < tokens1.length && isSubset(tokens2, tokens1)) return true;
  }

  return false;
}
