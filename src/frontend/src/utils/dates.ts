export function getCurrentMonth(): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[new Date().getMonth()];
}

export function getCurrentYear(): bigint {
  return BigInt(new Date().getFullYear());
}

export function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp / BigInt(1000000)));
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp / BigInt(1000000)));
  return date.toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getAllMonths(): string[] {
  return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
}

export function getYearRange(): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
}
