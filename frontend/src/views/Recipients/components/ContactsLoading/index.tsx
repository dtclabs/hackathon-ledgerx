/* eslint-disable react/no-array-index-key */
import Typography from '@/components-v2/atoms/Typography'
import { SkeletonLoader } from '@/components-v2/molecules/SkeletonLoader'

const ContactsLoading = () => (
  <div className=" border-[#CECECC] border rounded-lg">
    <div className="bg-grey-100 border-b border-dashboard-border-200 flex flex-row gap-6 px-6 items-center">
      <div className="basis-[30%] py-3">
        <Typography variant="caption" color="primary" styleVariant="medium">
          Name
        </Typography>
      </div>
      <div className="basis-[30%] py-3">
        <Typography variant="caption" color="primary" styleVariant="medium">
          Address
        </Typography>
      </div>
      <div className="basis-[20%] py-3">
        <Typography variant="caption" color="primary" styleVariant="medium">
          Last Updated
        </Typography>
      </div>
      <div className="basis-[20%] py-3">
        <Typography variant="caption" color="primary" styleVariant="medium">
          Actions
        </Typography>
      </div>
    </div>
    {[...Array(5).keys()].map((item, index) => (
      <div
        key={index}
        className="flex flex-row gap-6 h-[80px] items-center px-6"
        style={{ borderBottom: '1px solid #F1F1EF' }}
      >
        <div className="basis-[30%]">
          <SkeletonLoader variant="rounded" height={14} width={150} />
        </div>
        <div className="basis-[30%]">
          <SkeletonLoader variant="rounded" height={14} width={150} />
        </div>
        <div className="basis-[20%]">
          <SkeletonLoader variant="rounded" height={14} width={100} />
        </div>
        <div className="basis-[20%]">
          <SkeletonLoader variant="rounded" height={14} width={100} />
        </div>
      </div>
    ))}
  </div>
)

export default ContactsLoading
