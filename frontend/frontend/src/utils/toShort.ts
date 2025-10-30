const toShort = (input: string, numberOfFirstPart: number, numberOfLastPart: number): string =>
  input &&
  `${input.substring(0, numberOfFirstPart)}...${input.substring(input.length - numberOfLastPart, input.length)}`

export { toShort }
