import Typography from '@/components-v2/atoms/Typography'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import { useRouter } from 'next/router'
import ReactCountryFlag from 'react-country-flag'
import ReactTooltip from 'react-tooltip'

const CountryCurrency = ({ country, currency, organizationId }) => {
  const router = useRouter()
  const handleRedirectToOrgSettings = (e) => {
    e.stopPropagation()
    router.push(`/${organizationId}/orgsettings?activeTab=reportingPreferences`)
  }
  return (
    <div className="flex items-center w-fit h-fit gap-2" data-tip="country-flag" data-for="country-flag">
      <ReactCountryFlag
        // countryCode={country.iso}
        countryCode="US"
        svg
        style={{
          fontSize: '20px',
          lineHeight: '20px',
          borderRadius: '50%',
          objectFit: 'cover'
        }}
      />

      {/* <DividerVertical height="h-4" className="border-l border-blanca-300" /> */}
      <Typography color="black" variant="body2">
        {/* {currency} */} USD
      </Typography>
      <ReactTooltip
        id="country-flag"
        borderColor="#eaeaec"
        border
        backgroundColor="white"
        textColor="#111111"
        effect="solid"
        place="bottom"
        className="!opacity-100 !rounded-lg font-inter w-[236px]"
        clickable
        delayHide={50}
      >
        <Typography color="primary" variant="caption" styleVariant="regular">
          Country: USA
          {/* Country: {country.name} */}
        </Typography>
        <Typography color="primary" variant="caption" styleVariant="regular">
          {/* Currency: {currency} */}
          Currency: USD
        </Typography>
        <Typography color="primary" variant="caption" styleVariant="regular">
          You can change these settings under{' '}
          <button className="underline inline-block" type="button" onClick={handleRedirectToOrgSettings}>
            Organisation Settings
          </button>{' '}
          page
        </Typography>
      </ReactTooltip>
    </div>
  )
}

export default CountryCurrency
