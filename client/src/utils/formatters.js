export function formatCurrency(amount, currency = 'INR') {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;

  if (currency === 'INR') {
    return '₹' + num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD'
  }).format(num);
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatPercentage(value) {
  const num = parseFloat(value) || 0;
  return `${num.toFixed(1)}%`;
}
