import { ReactNode } from 'react'

const CONTACT_LINK = 'https://www.ledgerx.com/contact#request-support-section'

export const addLinkToMessage = (_text: string, wordToLink: string): ReactNode => {
  const spiltMessage = _text.split(wordToLink)
  return (
    <div>
      {spiltMessage[0]}
      <a
        href={CONTACT_LINK}
        target="_blank"
        rel="noreferrer"
        className="hover:pointer underline underline-offset-2 decoration-current"
      >
        {wordToLink}
      </a>
      {spiltMessage[1]}
    </div>
  )
}
