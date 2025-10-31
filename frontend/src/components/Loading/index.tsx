import React from 'react'

const Loading = ({
  dark,
  height = 'h-[364px]',
  title,
  classNames,
  titleClassNames
}: {
  dark?: boolean
  height?: string
  title?: string
  classNames?: string
  titleClassNames?: string
}) => (
  <div className={`${height} w-full flex justify-center items-center flex-col bg-white py-20 ${classNames}`}>
    {title && <p className={`font-inter text-xl font-semibold text-dashboard-main ${titleClassNames}`}>{title}</p>}
    {dark ? (
      <div className="flex gap-6 mt-6">
        <div className="w-4 h-4 rounded-full bg-grey-900 animate-bounce" />
        <div className="w-4 h-4 rounded-full  bg-grey-900 animate-bounce" />
        <div className="w-4 h-4 rounded-full  bg-grey-900 animate-bounce" />
      </div>
    ) : (
      <div className="flex gap-6 mt-6">
        <div className="w-4 h-4 rounded-full bg-blue-400 animate-bounce" />
        <div className="w-4 h-4 rounded-full bg-yellow-400 animate-bounce" />
        <div className="w-4 h-4 rounded-full bg-red-500 animate-bounce" />
      </div>
    )}
  </div>
)

export default Loading
