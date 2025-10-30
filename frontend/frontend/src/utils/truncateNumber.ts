export const truncateNumber = (num: number, places: number) => Math.trunc(num * 10 ** places) / 10 ** places
