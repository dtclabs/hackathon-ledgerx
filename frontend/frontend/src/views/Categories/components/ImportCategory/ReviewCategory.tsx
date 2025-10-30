import { ICategories } from '@/slice/categories/interfaces'
import { IPagination } from '@/api/interface'
import { toShort } from '@/utils/toShort'
import React, { useEffect, useState } from 'react'
import { CATEGORY_TYPES } from '@/constants/categoryTypes'
import { isNumber } from '@/utils/isNumber'

export interface IReviewCategory {
  item: any[]
  description: any
  categories: IPagination<ICategories>
  option: string
  codeExists: any[]
  nameExists: any[]
  index: number
  invalidList: any[]
}

const ReviewCategory: React.FC<IReviewCategory> = ({
  codeExists,
  option,
  categories,
  item,
  description,
  nameExists,
  index,
  invalidList
}) => {
  const [isCodeError, setIsCodeError] = useState(false)
  const [isNameError, setIsNameError] = useState(false)
  const [isTypeError, setIsTypeError] = useState(false)

  useEffect(() => {
    if (option) {
      setIsNameError(false)
      setIsCodeError(false)
    }
  }, [option])

  useEffect(() => {
    if (option === 'Append to existing category list') {
      if (invalidList.find((data) => data[4] === item[4])) {
        setIsCodeError(false)
        setIsNameError(false)
      } else {
        if (
          categories.items.find((data) => data.code === item[0]) ||
          codeExists.find((data) => data.code === item[0] && data.id === item[4])
        ) {
          setIsCodeError(true)
        }

        if (codeExists.find((data) => data.code === item[0] && data.id !== item[4])) {
          setIsCodeError(true)
        }

        if (categories.items.find((data) => data.name === item[1]) || nameExists.find((data) => data.id === item[4])) {
          setIsNameError(true)
        }

        if (!/^\d+$/.test(item[0]) || !isNumber(item[0])) {
          setIsCodeError(true)
        }
      }
      if (CATEGORY_TYPES && !CATEGORY_TYPES.find((data) => data.type === item[2])) {
        setIsTypeError(true)
      } else setIsTypeError(false)
    } else {
      if (invalidList.find((data) => data[4] === item[4])) {
        setIsCodeError(false)
        setIsNameError(false)
      } else {
        if (!/^\d+$/.test(item[0])) {
          setIsCodeError(true)
        }
        if (!isNumber(item[0])) {
          setIsCodeError(true)
        }

        if (nameExists.find((data) => data.name === item[1] && data.id !== item[4])) {
          setIsNameError(false)
        }
        if (nameExists.find((data) => data.name === item[1] && data.id === item[4])) {
          setIsNameError(true)
        }
        if (codeExists.find((data) => data.code === item[0] && data.id === item[4])) {
          setIsCodeError(true)
        }
      }
      if (CATEGORY_TYPES && !CATEGORY_TYPES.find((data) => data.type === item[2])) {
        setIsTypeError(true)
      } else setIsTypeError(false)
    }
  }, [categories, codeExists, invalidList, item, nameExists, option])

  return (
    <div key={index} className="">
      <tr className=" border-t font-inter text-sm  leading-4 font-semibold h-4  ">
        <td className="pl-4 py-[16px] text-[#344054] text-left">
          <div className="flex gap-2 items-center w-[70px] ">
            <div className="flex flex-col">
              <div
                className={`font-normal  ${(isCodeError || item[0].length > 50) && 'line-through'} ${
                  !item[0] && 'h-4'
                }`}
              >
                {' '}
                {item[0] && item[0].length > 6 ? toShort(item[0], 6, 0) : item[0]}
              </div>
              <div className=" text-red-600 text-xs text-left  font-normal">
                {(!item[0] || isCodeError || item[0].length > 50) && 'Invalid code'}
              </div>
            </div>
          </div>
        </td>
        <td className="w-[216px] pl-4 py-[16px] text-[#344054] text-left ">
          <div className="flex gap-2 items-center  ">
            <div title={item[1]} className="font-medium text-left text-[#344054] truncate">
              <div className="flex flex-col">
                <div className={`${(isNameError || item[1].length > 250) && 'line-through'} ${!item[1] && 'h-4'}`}>
                  {' '}
                  {item[1] && item[1].length > 25 ? toShort(item[1], 25, 0) : item[1]}
                </div>
                <div className=" text-red-600 text-xs text-left font-normal">
                  {(!item[1] || isNameError || item[1].length > 250) && 'Invalid Name'}
                </div>
              </div>
            </div>
          </div>
        </td>
        <td className="w-[136px] pl-4 py-[16px] text-[#344054] truncate">
          <div className="flex gap-2 items-center  truncate">
            <div className="flex flex-col">
              <div title={item[2]} className={`${isTypeError && 'line-through'} ${!item[2] && 'h-4'}  font-medium `}>
                {item[2] && item[2].length > 15 ? toShort(item[2], 15, 0) : item[2]}
              </div>
              <div className=" text-red-600 text-xs text-left font-normal">
                {(!item[2] || isTypeError) && 'Invalid Type'}
              </div>
            </div>
          </div>
        </td>
        <td className="pl-4 py-[16px] w-[234px] text-[#344054]  truncate  ">
          <div className="flex flex-col">
            <div title={item[3]} className=" truncate font-medium ">
              {item[3] && item[3].length > 27 ? toShort(item[3], 27, 0) : item[3]}
            </div>
            <div className=" text-red-600 text-xs text-left font-normal">
              {item[3] && item[3].length > 1000 && 'Invalid Description'}
            </div>
          </div>
        </td>
      </tr>
    </div>
  )
}

export default ReviewCategory
