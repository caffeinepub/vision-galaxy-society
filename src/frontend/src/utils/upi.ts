export function buildUpiDeepLink(upiId: string, amount: bigint | number, note: string): string {
  if (!upiId) return '';
  
  const amountValue = typeof amount === 'bigint' ? Number(amount) : amount;
  
  const params = new URLSearchParams({
    pa: upiId,
    pn: 'Vision Galaxy Society',
    am: amountValue.toString(),
    cu: 'INR',
    tn: note,
  });

  return `upi://pay?${params.toString()}`;
}
