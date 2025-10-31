import Typography from '@/components-v2/atoms/Typography'
import { IContacts } from '@/slice/contacts/contacts.types'

const BasicInformationDetail = ({ contact }: { contact: IContacts }) => (
  <div className="rounded-lg border border-grey-200">
    <div className="bg-[#F9FAFB] rounded-t-lg p-4">
      <Typography variant="body1" color="dark" styleVariant="semibold">
        Basic Information
      </Typography>
    </div>
    <div className="flex flex-col gap-6 p-4">
      {contact?.organizationName && (
        <div className="flex items-center">
          <div className="w-[250px]">
            <Typography variant="body2" color="dark" styleVariant="semibold" classNames="w-[250px]">
              Organisation Name
            </Typography>
          </div>
          <Typography color="dark">{contact.organizationName}</Typography>
        </div>
      )}
      {contact?.organizationAddress && (
        <div className="flex items-center">
          <div className="w-[250px]">
            <Typography variant="body2" color="dark" styleVariant="semibold" classNames="w-[250px]">
              Organisation Mailing Address
            </Typography>
          </div>
          <Typography color="dark">{contact.organizationAddress}</Typography>
        </div>
      )}
      <div className="flex items-center">
        <div className="w-[250px]">
          <Typography variant="body2" color="dark" styleVariant="semibold" classNames="w-[250px]">
            {contact?.organizationName ? 'Contact Person' : 'Full Name'}
          </Typography>
        </div>
        <Typography color="dark"> {contact.contactName}</Typography>
      </div>
    </div>
  </div>
)

export default BasicInformationDetail
