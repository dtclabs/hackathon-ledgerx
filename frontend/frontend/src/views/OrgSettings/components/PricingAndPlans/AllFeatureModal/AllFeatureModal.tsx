/* eslint-disable react/no-array-index-key */
import Button from '@/components-v2/atoms/Button'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import { BaseTable } from '@/components-v2/molecules/Tables/BaseTable'
import Image from 'next/legacy/image'
import StarIcon from '@/public/svg/icons/star-icon.svg'
import CheckIcon from '@/public/svg/check-green.svg'
import { modalContent } from './modal-copy'
import React from 'react'

const renderCell = (cell) => {
  if (cell?.length > 0) {
    return cell
  }
  if (cell) {
    return <Image src={CheckIcon} width={18} height={18} />
  }
  return ''
}

const AllFeatureModal = ({ provider, onBuyPlan }) => (
  <BaseModal provider={provider} classNames="rounded-3xl h-[90vh] w-[80vw] min-w-[1200px]">
    <BaseModal.Header extendedClass="items-center">
      <BaseModal.Header.Title>Compare our plans</BaseModal.Header.Title>
      <BaseModal.Header.CloseButton />
    </BaseModal.Header>
    <BaseModal.Body extendedClass="!p-8 h-[calc(100%-64px)] mt-0">
      <div className="overflow-auto invisible-scrollbar h-full border-blanca-300 border border-x-0">
        <BaseTable extendedClass="!border-blanca-300 border-y-0">
          <BaseTable.Header>
            <BaseTable.Header.Row>
              <BaseTable.Header.Row.Cell extendedClass="w-1/5 !p-0">
                <div className="h-full p-6 pt-[50px] border-r border-b border-blanca-300" />
              </BaseTable.Header.Row.Cell>
              <BaseTable.Header.Row.Cell extendedClass="w-1/5 !p-0">
                <div className="flex flex-col justify-start h-full p-6 pt-[50px] border-r border-b border-blanca-300">
                  <Typography variant="heading3">Payouts Only</Typography>
                  <Typography
                    variant="caption"
                    styleVariant="semibold"
                    classNames="px-3 py-1 bg-blanca-300 rounded mt-8 text-center normal-case"
                  >
                    You will be downgraded to this plan on trial/paid plan expiry
                  </Typography>
                </div>
              </BaseTable.Header.Row.Cell>
              <BaseTable.Header.Row.Cell extendedClass="w-1/5 !p-0">
                <div className="flex flex-col justify-start h-full p-6 pt-[50px] border-r border-b border-blanca-300">
                  <Typography variant="heading3">Starter</Typography>
                  <Button
                    onClick={onBuyPlan('starter')}
                    label="Buy Plan"
                    height={40}
                    variant="black"
                    classNames="mt-8 w-full"
                  />
                </div>
              </BaseTable.Header.Row.Cell>
              <BaseTable.Header.Row.Cell extendedClass="relative w-1/5 !p-0">
                <div className="absolute top-0 left-0 w-[calc(100%-1px)] flex items-center gap-2 justify-center bg-[#FCF22D] h-8">
                  <Image src={StarIcon} />
                  <Typography variant="caption" styleVariant="semibold">
                    Recommended
                  </Typography>
                </div>
                <div className="flex flex-col justify-start h-full p-6 pt-[50px] border-r border-b border-blanca-300">
                  <Typography variant="heading3">Business</Typography>
                  <Button
                    onClick={onBuyPlan('business')}
                    label="Buy Plan"
                    height={40}
                    variant="black"
                    classNames="mt-8 w-full"
                  />
                </div>
              </BaseTable.Header.Row.Cell>
              <BaseTable.Header.Row.Cell extendedClass="w-1/5 !p-0">
                <div className="flex flex-col justify-start h-full p-6 pt-[50px] border-b border-blanca-300">
                  <Typography variant="heading3" classNames="whitespace-nowrap">
                    Partners Program
                  </Typography>
                  <Button
                    onClick={onBuyPlan('partnersProgram')}
                    label="Contact Us"
                    height={40}
                    variant="black"
                    classNames="mt-8 w-full"
                  />
                </div>
              </BaseTable.Header.Row.Cell>
            </BaseTable.Header.Row>
          </BaseTable.Header>
          <BaseTable.Body extendedClass="!divide-blanca-300">
            {modalContent.map((feature, featureIndex) => (
              <React.Fragment key={featureIndex}>
                <BaseTable.Body.Row>
                  <BaseTable.Body.Row.Cell colSpan={5} extendedClass="px-0 py-0">
                    <div className="flex justify-center bg-grey-200 py-4">
                      <Typography variant="body1" styleVariant="semibold">
                        {feature.feature}
                      </Typography>
                    </div>
                  </BaseTable.Body.Row.Cell>
                </BaseTable.Body.Row>
                {feature.content.map((row, rowIndex) => (
                  <BaseTable.Body.Row key={rowIndex}>
                    <BaseTable.Body.Row.Cell extendedClass="font-medium !p-0">
                      <div className="flex items-center gap-2 h-full border-r border-blanca-300 px-6 py-4">
                        {row.header.icon && <Image src={row.header.icon} width={18} height={18} />}
                        <Typography variant="body2" styleVariant="semibold">
                          {row.header.title}
                        </Typography>
                      </div>
                    </BaseTable.Body.Row.Cell>
                    <BaseTable.Body.Row.Cell extendedClass="text-center font-medium !p-0">
                      <div className="flex flex-col justify-center h-full border-r border-blanca-300 px-6 py-4">
                        {renderCell(row.payouts)}
                      </div>
                    </BaseTable.Body.Row.Cell>
                    <BaseTable.Body.Row.Cell extendedClass="text-center font-medium !p-0">
                      <div className="flex flex-col justify-center h-full border-r border-blanca-300 px-6 py-4">
                        {renderCell(row.stater)}
                      </div>
                    </BaseTable.Body.Row.Cell>
                    <BaseTable.Body.Row.Cell extendedClass="text-center font-medium !p-0">
                      <div className="flex flex-col justify-center h-full border-r border-blanca-300 px-6 py-4">
                        {renderCell(row.business)}
                      </div>
                    </BaseTable.Body.Row.Cell>
                    <BaseTable.Body.Row.Cell extendedClass="text-center font-medium !p-0">
                      <div className="flex flex-col justify-center h-full px-6 py-4">{renderCell(row.partners)}</div>
                    </BaseTable.Body.Row.Cell>
                  </BaseTable.Body.Row>
                ))}
              </React.Fragment>
            ))}
          </BaseTable.Body>
        </BaseTable>
      </div>
    </BaseModal.Body>
  </BaseModal>
)

export default AllFeatureModal
