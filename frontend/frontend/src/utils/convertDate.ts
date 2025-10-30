export const convertDate = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1 > 9 ? `${date.getMonth() + 1}` : `0${date.getMonth() + 1}`}-${
    date.getDate() > 9 ? `${date.getDate()}` : `0${date.getDate()}`
  }T00:00:00.000Z`

export const convertToTimeStamp = (time: Date) => time.setDate(time.getDate()) / 1000

export const getTimeStampDayBefore = (time: Date, day: number) => time.setDate(time.getDate() - day) / 1000
