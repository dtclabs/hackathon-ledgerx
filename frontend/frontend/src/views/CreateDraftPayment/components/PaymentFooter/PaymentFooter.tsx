import { AuthenticatedView as View } from '@/components-v2/templates/AuthenticatedView'
import Button from '@/components-v2/atoms/Button'
import { NoBorderDropdown } from '@/components-v2/atoms/Dropdown'
import React from 'react'
import ReviewerOptionLabel from '../ReviewerOptionLabel'

interface IPaymentFooterProps {
  members: any
  reviewer: {
    value: any
    label: string
  }
  isLoadingWithLabelForSaveDraft?: boolean
  isLoadingWithLabelForReview?: boolean
  isDisabled?: boolean
  handleClickFooterSecondary: () => void
  handleChangeReviewer: (_value: any) => void
  handleFormSubmit: () => Promise<void>
  handleSubmitForReview: () => Promise<void>
}

const PaymentFooter: React.FC<IPaymentFooterProps> = ({
  members,
  reviewer,
  isLoadingWithLabelForSaveDraft,
  isLoadingWithLabelForReview,
  isDisabled,
  handleClickFooterSecondary,
  handleFormSubmit,
  handleChangeReviewer,
  handleSubmitForReview
}) => (
  <View.Footer extraClassName="!pl-0 !pt-0">
    <section id="footer-buttons" className="flex flex-row justify-between p-4 bg-white border-t border-[#F1F1EF]">
      <div className="flex gap-2">
        <Button height={48} variant="grey" label="Cancel" onClick={handleClickFooterSecondary} />
        <Button
          variant="black"
          height={48}
          label="Save as Drafts"
          loadingWithLabel={isLoadingWithLabelForSaveDraft}
          disabled={isDisabled}
          onClick={handleFormSubmit}
        />
      </div>
      <div className="border border-[#F1F1EF] flex w-fit-content p-1 rounded gap-2">
        <NoBorderDropdown
          options={members?.data?.items
            .map((member) => ({
              value: member.id,
              label: `${member.firstName} ${member.lastName}`
            }))
            .concat({
              value: null,
              label: 'Anyone can review'
            })}
          showCaret
          onChange={(value) => {
            handleChangeReviewer(value)
          }}
          defaultValue={{ value: null, label: 'Anyone can review' }}
          value={reviewer}
          sizeVariant="small"
          isSearchable
          menuPlacement="top"
          formatOptionLabel={ReviewerOptionLabel}
        />
        <Button
          variant="grey"
          height={40}
          label="Submit For Review"
          onClick={handleSubmitForReview}
          loadingWithLabel={isLoadingWithLabelForReview}
          classNames="grow"
          disabled={isDisabled}
        />
      </div>
    </section>
  </View.Footer>
)

export default PaymentFooter
