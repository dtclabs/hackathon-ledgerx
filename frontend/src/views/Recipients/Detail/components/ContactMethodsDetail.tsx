import Typography from '@/components-v2/atoms/Typography'
import { IContacts } from '@/slice/contacts/contacts.types'

const ContactMethodsDetail = ({ contactMethods }: { contactMethods: IContacts['recipientContacts'] }) => (
  <div className="rounded-lg border border-grey-200">
    <div className="bg-[#F9FAFB] rounded-t-lg p-4 flex items-center">
      <Typography variant="body1" color="dark" styleVariant="semibold">
        Contact Methods
      </Typography>
    </div>
    <div className="flex flex-col gap-6 p-4">
      {contactMethods?.length > 0 ? (
        contactMethods.map((provider) => (
          <div key={provider.id} className="flex items-center">
            <div className="w-[250px]">
              <Typography variant="body2" color="dark" styleVariant="semibold" classNames="w-[250px]">
                {provider?.contactProvider?.name || 'Telegram'}
              </Typography>
            </div>
            <Typography color="dark">{provider.content}</Typography>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-start justify-center">
          <Typography>No contact methods</Typography>
        </div>
      )}
    </div>
  </div>
)

export default ContactMethodsDetail
