export function buildWhatsappDeepLink(mobileNumber: string, message: string): string {
  if (!mobileNumber) return '';
  
  const cleanNumber = mobileNumber.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}
