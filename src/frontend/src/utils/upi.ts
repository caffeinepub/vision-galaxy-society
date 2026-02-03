export function buildUpiDeepLink(upiId: string, amount: number, note: string): string {
  if (!upiId) return '';
  
  const params = new URLSearchParams({
    pa: upiId,
    pn: 'Vision Galaxy Society',
    am: amount.toString(),
    cu: 'INR',
    tn: note,
  });

  return `upi://pay?${params.toString()}`;
}
