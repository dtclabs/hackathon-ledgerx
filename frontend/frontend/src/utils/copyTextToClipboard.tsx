import { useState } from 'react'

const copyTextToClipboard = (text: string): void => {
  const listener = (e: ClipboardEvent): void => {
    e.preventDefault()
    if (e.clipboardData) {
      e.clipboardData.setData('text/plain', text)
    }
  }

  const range = document.createRange()

  const documentSelection = document.getSelection()
  if (!documentSelection) {
    return
  }

  range.selectNodeContents(document.body)
  documentSelection.addRange(range)
  document.addEventListener('copy', listener)
  document.execCommand('copy')
  document.removeEventListener('copy', listener)
  documentSelection.removeAllRanges()
}

type Props = {
  textToCopy: string
  tooltip?: string
  tooltipAfterCopy?: string
  width?: string
  height?: string
  className?: string
}

const CopyToClipboardBtn = ({
  width,
  height,
  textToCopy,
  tooltip = 'Copy to clipboard',
  className = '-left-[25%]'
}: Props): React.ReactElement => {
  const [clicked, setClicked] = useState<boolean>(false)

  const copy = () => {
    copyTextToClipboard(textToCopy)
    setClicked(true)
    setTimeout(() => setClicked(false), 500)
  }

  const onButtonClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation()
    copy()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    // prevents event from bubbling when `Enter` is pressed
    if (event.keyCode === 13) {
      event.stopPropagation()
    }
    copy()
  }

  const onButtonBlur = (): void => {
    setTimeout((): void => setClicked(false), 300)
  }

  return (
    <div className=" flex items-center max-w-max">
      <button
        type="button"
        className={`relative rounded-full w-full cursor-pointer ${width ? '' : 'hover:bg-gray-100 py-2 px-1'}   `}
        onClick={onButtonClick}
        onKeyDown={onKeyDown}
        onMouseLeave={onButtonBlur}
      >
        <div className={` ${width || 'w-4'} ${height || 'h-4'} flex items-center`}>
          <img className="w-3 h-3" src="/svg/Copy.svg" alt="copy" />
        </div>

        {clicked && (
          <div className={`absolute px-2 py-1 -top-[70%] ${className} bg-gray-100 text-xs text-gray-500 rounded-full opacity-95`}>
            Copied!
          </div>
        )}
      </button>
    </div>
  )
}

export default CopyToClipboardBtn
