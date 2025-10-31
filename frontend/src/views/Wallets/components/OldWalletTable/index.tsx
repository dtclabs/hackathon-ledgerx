import React, { useState } from 'react'
import { IBalanceAllocationProps } from '../AddWallet/types'
import SourcesData from '../SourcesData/SourcesData'

const OldWalletTable = (props: IBalanceAllocationProps) => {
  const { data, token, emptyState } = props
  return (
    <div className="min-w-max pt-4">
      {(data &&
        data.length > 0 &&
        data.map(
          (item, index) =>
            item && (
              <SourcesData
                address={item.address}
                disabled={item.disabled}
                className={index === data.length - 1 && 'mb-0'}
                token={token}
                type={item.type}
                onButtonClick={item.onButtonClick}
                onEditButton={item.onEditButton}
                onFlagButton={item.onFlagButton}
                rating={item.rating}
                title={item.title}
                subTitle={item.subTitle}
                price={item.price}
                subPrice={item.subPrice}
                iconRight={item.iconRight}
                iconLeft={item.iconLeft}
                iconEdit={item.iconEdit}
                iconFlag={item.iconFlag}
                key={item.id}
                flag={item.flag}
              />
            )
        )) || <div className="h-[348px] w-full flex justify-center items-center">{emptyState}</div>}
    </div>
  )
}

export default OldWalletTable
