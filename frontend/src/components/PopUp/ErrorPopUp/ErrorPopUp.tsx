import React from 'react'

interface IErrorPopUp {
  title: string | any
  description?: string | any
  action: () => void
  buttonText?: string
  safe?: boolean
  error?: boolean
  moreActions?: () => void
  totalAmount?: string
  balance?: string
}

const ErrorPopUp: React.FC<IErrorPopUp> = ({
  title,
  description,
  action,
  buttonText,
  safe = false,
  error,
  moreActions,
  totalAmount,
  balance
}) => (
  <div className=" w-[600px] max-w-2xl rounded-[24px]  text-center bg-white">
    {!safe ? (
      <>
        {totalAmount && balance ? (
          <div className="flex flex-col justify-center p-8">
            <div className="flex mb-4 justify-center">
              <img src="/image/ErrorSafe.png" alt="ErrorSafe" />
            </div>
            <div className="mb-1 text-2xl font-supply text-black-0 uppercase">
              {totalAmount && balance ? 'INSUFFICIENT BALANCE' : title}
            </div>
            <div className="text-[#787878]  font-inter text-base   whitespace-pre-line">
              {totalAmount && balance ? '' : description}
            </div>
            {totalAmount && balance && (
              <div className="text-[#787878]  font-inter text-base   whitespace-pre-line">
                Please make sure your wallet holds enough balance to cover the transaction amount and gas fees.
                <br />
                <div className="flex justify-center">
                  Balance is <p className="font-semibold pl-1"> {balance} </p>
                </div>
                <div className="flex justify-center">
                  Transferring amount is <p className="font-semibold pl-1"> {totalAmount} </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex  p-8">
            <div className=" mr-8">
              <img src="/image/ErrorSafe.png" alt="ErrorSafe" />
            </div>
            <div className="w-full">
              <div className="mb-1 text-2xl font-supply text-black-0 text-left">{title}</div>
              <div className="text-[#787878]  font-inter text-base text-left  whitespace-pre-line">{description}</div>
            </div>{' '}
          </div>
        )}

        <div className="border-b " />
        {error ? (
          <div className="m-8 flex gap-4">
            <button
              onClick={action}
              type="button"
              className=" py-4  w-[25%] rounded-[8px] text-base font-semibold hover:bg-gray-300 text-black-0 font-inter bg-remove-icon"
            >
              Cancel
            </button>
            <button
              onClick={moreActions}
              type="button"
              className=" py-4 w-[75%] rounded-[8px] text-base font-semibold hover:bg-grey-901 text-white font-inter bg-grey-900"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="m-8 flex gap-4">
            <button
              onClick={action}
              type="button"
              className=" py-4  w-full rounded-[8px] text-base font-semibold hover:bg-grey-901 text-white font-inter bg-grey-900"
            >
              {buttonText || 'OK'}
            </button>
          </div>
        )}
      </>
    ) : (
      <>
        <div className="p-8">
          <div className="flex justify-center mb-6 ">
            <img src="/image/ErrorSafe.png" alt="ErrorSafe" />
          </div>
          <div className="">
            <div>
              <div className="mb-1 text-2xl font-supply text-black-0 uppercase">{title} </div>
              <div className="text-[#787878]  font-inter text-base   whitespace-pre-line">{description}</div>
            </div>{' '}
          </div>
        </div>
        <div className="border-b " />
        {error ? (
          <div className="m-8 flex gap-4">
            <button
              onClick={action}
              type="button"
              className=" py-4  w-[25%] rounded-[8px] text-base font-semibold hover:bg-gray-300 text-black-0 font-inter bg-remove-icon"
            >
              Cancel
            </button>

            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://ledgerx.com"
              className=" py-4 flex-1 font-semibold rounded-[8px] text-base hover:bg-grey-901 text-white font-inter bg-grey-900"
            >
              Learn more
            </a>
          </div>
        ) : (
          <div className="m-8 flex gap-4">
            <button
              onClick={action}
              type="button"
              className=" py-4 w-full rounded-[8px] text-base font-semibold hover:bg-grey-901 text-white font-inter bg-grey-900"
            >
              {buttonText || 'OK'}
            </button>
          </div>
        )}
      </>
    )}
  </div>
)
export default ErrorPopUp
