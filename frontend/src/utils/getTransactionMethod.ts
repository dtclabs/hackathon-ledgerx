const TRANSACTION_METHOD = [
  {
    name: 'approve',
    title: 'Approved contract'
  },
  {
    name: 'Null',
    title: 'Contract interaction'
  }
]

const upperCaseSplit = (sentences: string) => {
  const newWord = []
  sentences = sentences.split('(')[0]
  const { length } = sentences
  let index = 0
  for (let i = 0; i < length; i++) {
    if (sentences.charAt(i) === sentences.charAt(i).toUpperCase()) {
      newWord.push(sentences.slice(index, i))
      index = i
    }
  }
  newWord.push(sentences.slice(index, length))
  return newWord.join(' ')
}

export const getTransactionMethod = (method: string) =>
  method &&
  (TRANSACTION_METHOD.find((methodItem) => method.includes(methodItem.name))
    ? TRANSACTION_METHOD.find((methodItem) => method.includes(methodItem.name)).title
    : upperCaseSplit(method))
