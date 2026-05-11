export const getOccupancyPercent = (occ) => {
  if (!occ) return 0;
  const match = occ.toString().match(/(\d+\.?\d*)%/);
  if (match) return Math.min(parseFloat(match[1]), 100);
  if (occ.toString().includes('/')) {
      const parts = occ.toString().split('/');
      const val = Math.round((parseFloat(parts[0]) / parseFloat(parts[1])) * 100);
      return isNaN(val) ? 0 : Math.min(val, 100);
  }
  return 0;
};

export const formatKg = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M kg';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k kg';
  return num + ' kg';
};

export const parseNum = (str) => {
  if (!str) return 0;
  return parseFloat(str.toString().replace(/,/g, '')) || 0;
};
