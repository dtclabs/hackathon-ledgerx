import { Result } from '@/shared/types'

export const truncateString = (data, split) => {
  if (!data) return ''
  if (split === 0) return data
  if (data?.length <= 2 * split) {
    return data
  }

  const firstPart = data.substring(0, split)
  const lastPart = data.substring(data.length - split)

  return `${firstPart}...${lastPart}`
}

export function trimAndEllipsis(_text, maxLength) {
  if (_text.length <= maxLength) {
    return _text
  }

  // Trim the CSS text to the specified length
  const trimmedCss = _text.substring(0, maxLength)

  // Add "..." to indicate that the text has been trimmed
  const trimmedWithEllipsis = `${trimmedCss}...`

  return trimmedWithEllipsis
}

export const extractNameFromUUIDString = (_value: string): Result<{ uuid: string; fileName: string }, any> => {
  const inputString = _value
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  const uuidMatch = inputString.match(uuidRegex)
  if (uuidMatch) {
    const uuid = uuidMatch[0]
    const restOfString = inputString.slice(uuid.length + 1) // Skip the UUID and the following hyphen

    return {
      isSuccess: true,
      data: {
        uuid,
        fileName: restOfString
      }
    }
  }
  return {
    isSuccess: false,
    error: 'UUID not found in the input string'
  }
}
