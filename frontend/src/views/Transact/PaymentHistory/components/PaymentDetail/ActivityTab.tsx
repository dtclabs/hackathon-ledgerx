import { IPayment, ProviderStatus } from '@/api-v2/payment-api'
import Typography from '@/components-v2/atoms/Typography'
import { format } from 'date-fns'
import PaymentStatusPill from '../PaymentHistoryTable/PaymentStatusPill'

const ActivityTab: React.FC<{ data: IPayment }> = ({ data }) => (
  <div className="pt-4">
    <section className="flex flex-row items-center justify-between mb-7">
      <Typography styleVariant="semibold" color="secondary">
        Status
      </Typography>
      <PaymentStatusPill providerStatus={data?.providerStatus as ProviderStatus} />
    </section>

    {data?.createdAt && (
      <>
        <section className="flex flex-row items-center justify-between mt-2">
          <Typography styleVariant="semibold" color="secondary">
            Created On
          </Typography>
          <Typography color="secondary">
            {(data?.createdAt && `${format(new Date(data?.createdAt), 'dd MMM yyyy, hh:mm a')}`) || '-'}
          </Typography>
        </section>
        <section className="flex flex-row items-center justify-between mt-6 w-full">
          <Typography styleVariant="semibold" color="secondary" classNames="w-[200px] shrink-0">
            Created By
          </Typography>
          <Typography color="secondary" classNames="ml-3 text-right break-words w-[220px]">
            {data?.createdBy?.name || '-'}
          </Typography>
        </section>
      </>
    )}
    {data?.reviewRequestedAt && (
      <>
        <section className="flex flex-row items-center justify-between mt-6">
          <Typography styleVariant="semibold" color="secondary">
            Submitted For Review On
          </Typography>
          <Typography color="secondary" classNames="">
            {(data?.reviewRequestedAt && `${format(new Date(data?.reviewRequestedAt), 'dd MMM yyyy, hh:mm a')}`) || '-'}
          </Typography>
        </section>
        <section className="flex flex-row items-center justify-between mt-6">
          <Typography styleVariant="semibold" color="secondary" classNames="w-[200px] shrink-0">
            Submitted For Review By
          </Typography>
          <Typography color="secondary" classNames="ml-3 text-right break-words w-[220px]">
            {data?.reviewRequestedBy?.name || '-'}
          </Typography>
        </section>
      </>
    )}
    {data?.reviewedAt && (
      <>
        <section className="flex flex-row items-center justify-between mt-6">
          <Typography styleVariant="semibold" color="secondary">
            Reviewed On
          </Typography>
          <Typography color="secondary" classNames="">
            {(data?.reviewedAt && `${format(new Date(data?.reviewedAt), 'dd MMM yyyy, hh:mm a')}`) || '-'}
          </Typography>
        </section>
        <section className="flex flex-row items-center justify-between mt-6">
          <Typography styleVariant="semibold" color="secondary" classNames="w-[200px] shrink-0">
            Reviewed By
          </Typography>
          <Typography color="secondary" classNames="ml-3 text-right break-words w-[220px]">
            {data?.reviewedBy?.name || '-'}
          </Typography>
        </section>
      </>
    )}
    {data?.executedAt && (
      <>
        <section className="flex flex-row items-center justify-between mt-6">
          <Typography styleVariant="semibold" color="secondary">
            Executed On
          </Typography>
          <Typography color="secondary" classNames="">
            {(data?.executedAt && `${format(new Date(data?.executedAt), 'dd MMM yyyy, hh:mm a')}`) || '-'}
          </Typography>
        </section>
        <section className="flex flex-row items-center justify-between mt-6">
          <Typography styleVariant="semibold" color="secondary" classNames="w-[200px] shrink-0">
            Executed By
          </Typography>
          <Typography color="secondary" classNames="ml-3 text-right break-words w-[220px]">
            {data?.executedBy?.name || '-'}
          </Typography>
        </section>
      </>
    )}

    {data?.providerStatus === ProviderStatus.FAILED && (
      <section className="flex flex-row items-center justify-between mt-6">
        <Typography styleVariant="semibold" color="secondary" classNames="w-[200px] shrink-0">
          Failed On
        </Typography>
        <Typography color="secondary" classNames="ml-3 text-right break-words w-[220px]">
          {format(new Date(data?.failedAt || data?.updatedAt), 'dd MMM yyyy, hh:mm a')}
        </Typography>
      </section>
    )}
    {data?.providerStatus === ProviderStatus.COMPLETED && (
      <section className="flex flex-row items-center justify-between mt-6">
        <Typography styleVariant="semibold" color="secondary" classNames="w-[200px] shrink-0">
          Completed On
        </Typography>
        <Typography color="secondary" classNames="ml-3 text-right break-words w-[220px]">
          {format(new Date(data?.executedAt || data?.updatedAt), 'dd MMM yyyy, hh:mm a')}
        </Typography>
      </section>
    )}
  </div>
)

export default ActivityTab
