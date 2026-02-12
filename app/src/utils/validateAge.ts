export function calculateAge(day: number, month: number, year: number): number {
  const bd = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - bd.getFullYear();
  const monthDiff = today.getMonth() - bd.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bd.getDate())) age--;
  return age;
}

export function isValidDate(day: number, month: number, year: number): boolean {
  return (
    day >= 1 &&
    day <= 31 &&
    month >= 1 &&
    month <= 12 &&
    year >= 1900 &&
    year <= new Date().getFullYear()
  );
}

export function isAdult(day: number, month: number, year: number): boolean {
  return calculateAge(day, month, year) >= 18;
}
