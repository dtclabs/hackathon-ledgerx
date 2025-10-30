export const formatNumber = (
  num: number | string,
  option?: { minimumFractionDigits?: number; maximumFractionDigits?: number; useGrouping?: boolean; locate?: string }
) =>
  Number(num).toLocaleString(option?.locate || 'en-US', {
    useGrouping: option?.useGrouping || true,
    minimumFractionDigits: option?.minimumFractionDigits || 0,
    maximumFractionDigits: option?.maximumFractionDigits || 18
  })
