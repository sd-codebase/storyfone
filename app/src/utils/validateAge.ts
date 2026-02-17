export function calculateAgeFromYear(year: number): number {
  return new Date().getFullYear() - year;
}

export function isEligibleFromYear(year: number): boolean {
  return calculateAgeFromYear(year) >= 13;
}

export function isAdultFromYear(year: number): boolean {
  return calculateAgeFromYear(year) >= 18;
}

export function isValidYear(year: number): boolean {
  return year >= 1900 && year <= new Date().getFullYear();
}
