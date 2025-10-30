/* eslint-disable no-unneeded-ternary */
import React from 'react'
import Button from '@/components-v2/atoms/Button'
import { UseFormReturn} from 'react-hook-form'
import Image from 'next/legacy/image'
import TextField from '@/components/TextField/TextField'
import { useRouter } from 'next/router'
import Typography from '@/components-v2/atoms/Typography'
import BigClose from '@/public/svg/BigClose.svg'
import { useRequestNFTWaitListMutation } from '@/api-v2/nft/nfts-api'
import { toast } from 'react-toastify'
import { FormGroup} from '@/components-v2/molecules/Forms'

interface INFTWaitlistFormProps {
  form: UseFormReturn
  handleCloseWaitlistModal: () => void
  onSuccessSubmitWaitlist: () => void;
}

const NFTWaitlistFormModal: React.FC<INFTWaitlistFormProps> = ({
  form,
  handleCloseWaitlistModal,
  onSuccessSubmitWaitlist
}) => {
  const router = useRouter()
  const { organizationId } = router.query
  const { handleSubmit, control, formState } = form
  const [requestNftWaitListApi, { isLoading }] = useRequestNFTWaitListMutation()

  const handleOnSubmitWaitlistForm = async (data) => {
    try {
      const response = await requestNftWaitListApi({
        organizationId: organizationId as string,
        payload: {
          contactEmail: data.email,
          featureName: 'nft'
        }
      })
      // @ts-ignore
      if (response && !response?.error) {
        toast.success('You have submitted your whitelist request successfully.')
        onSuccessSubmitWaitlist()
      } else {
        // @ts-ignore
        const errorMessage = response?.error?.data?.message || 'An error has occurred. Please try again later.'
        toast.error(errorMessage)
      }

      handleCloseWaitlistModal()
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error has occurred. Please try again later.')
    }
  }

  return (
    <div className=" w-[600px]  bg-white  rounded-3xl shadow-home-modal">
      <div className="p-8 font-inter">
        <div className="flex justify-between w-full items-center">
          <Typography classNames="flex items-center font-epilogue text-[#2D2D2C]" variant="heading2">
            Join the NFT Feature Waitlist
          </Typography>
          <Image className="cursor-pointer" onClick={handleCloseWaitlistModal} src={BigClose} height={40} width={40} />
        </div>
        <Typography variant="body2" classNames="w-[460px]" color="discription">
          The team will reach out to you via the below contact once the NFT Feature is ready.
        </Typography>
      </div>
      <hr className="mt-2" />
      <form onSubmit={handleSubmit(handleOnSubmitWaitlistForm)}>
        <section id="modal-body" className="p-4 px-8 font-inter">
          <div className="w-full">
            <FormGroup required label="Email" extendClass="font-bold">
              <TextField control={control} name="email" placeholder="Enter Email" errors={formState.errors} required />
            </FormGroup>
          </div>
        </section>
        <hr className="mt-4 mb-3" />
        <section id="modal-footer" className="flex flex-row font-inter p-6 gap-4 px-8">
          <Button
            variant="black"
            height={48}
            type="submit"
            width="w-full"
            label="Submit"
            loading={isLoading}
            disabled={isLoading}
          />
        </section>
      </form>
    </div>
  )
}
export default NFTWaitlistFormModal