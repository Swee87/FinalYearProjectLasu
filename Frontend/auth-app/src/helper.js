export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

export function convertCurrencyString(currencyStr) {
    // Check if currencyStr is valid and convert to string
    if (currencyStr == null || currencyStr === undefined) {
        throw new Error("Invalid input: currencyStr is null or undefined");
    }
    const str = String(currencyStr); // 
    const cleanedStr = str.replace(/[^0-9.-]+/g, '');
    const value = parseFloat(cleanedStr);
    return value
} 

// utils/formatDate.js
export function formatReadableDate(isoDate) {
  if (!isoDate) return 'No date';
  const date = new Date(isoDate);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long', // You can use 'short' or '2-digit' if preferred
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
