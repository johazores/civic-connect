export function createPaymentReferenceCode() {
  const year = String(new Date().getFullYear()).slice(-2);
  const random = Math.floor(100000 + Math.random() * 900000);
  return `PAY-${year}-${random}`;
}
