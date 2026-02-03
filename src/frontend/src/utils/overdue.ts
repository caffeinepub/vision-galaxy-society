export function isOverduePeriod(): boolean {
  const today = new Date();
  return today.getDate() >= 6;
}

export function shouldShowOverdueNotice(isPaid: boolean): boolean {
  return isOverduePeriod() && !isPaid;
}
