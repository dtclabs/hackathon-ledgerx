import { FC, useMemo } from 'react'
import Typography from '@/components-v2/atoms/Typography'
import { BaseModal } from '@/components-v2/molecules/Modals/BaseModal'
import ExportsOnboardingImage from '@/public/content/exports-image.png'
import XeroExportOnboardingContent from '@/public/content/export-onboarding-content.png'
import QuickBooksExportOnboardingContent from '@/public/content/quickbooks-export-onboarding.png'
import Image from 'next/legacy/image'
import { OrgIntegration } from '@/slice/org-integration/org-integration-slice'
import { IntegrationName } from '@/api-v2/organization-integrations'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { useAppSelector } from '@/state'
import { selectFeatureState } from '@/slice/feature-flags/feature-flag-selectors'
import { ExportMethod } from '../ExportModalV2/interface'

interface IProps {
  provider: any
  accountingIntegration?: OrgIntegration
  exportType: ExportMethod
}

const ExportOnboardModal: FC<IProps> = ({ provider, accountingIntegration, exportType }) => {
  const organizationId = useOrganizationId()
  const isNewExportsCSVEnabled = useAppSelector((state) => selectFeatureState(state, 'isNewExportsCSVEnabled'))
  const onClickOk = () => {
    provider.methods.setIsOpen(false)
  }

  const onClickDontShow = () => {
    if (!window.sessionStorage.getItem('dont-show-export-onboarding-modal-again')) {
      window.sessionStorage.setItem('dont-show-export-onboarding-modal-again', JSON.stringify([organizationId]))
    } else {
      const currentBannerOrgs = JSON.parse(window.sessionStorage.getItem('dont-show-export-onboarding-modal-again'))
      if (!currentBannerOrgs.includes(organizationId)) {
        window.sessionStorage.setItem(
          'dont-show-export-onboarding-modal-again',
          JSON.stringify([...currentBannerOrgs, organizationId])
        )
      }
    }
    provider.methods.setIsOpen(false)
  }

  const integrationName = useMemo(
    () => (accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS ? 'QuickBooks' : 'Xero'),
    [accountingIntegration?.integrationName]
  )

  const exportOnboardHandler = useMemo(() => {
    switch (exportType) {
      case ExportMethod.TRANSACTIONS:
        return {
          title: 'CSV export has started...',
          content: 'Monitor the download status under',
          subcontent: 'Once generated, download the CSV.'
        }
      case ExportMethod.BANK_FEEDS:
        return {
          title: 'Bank feed export has started...',
          content: 'Monitor the download status under',
          subcontent: 'Once generated, download the bank feed.'
        }
      case ExportMethod.JOURNAL_ENTRIES:
        return {
          title: 'Journal entries generation has started...',
          content: 'Monitor the journal entries generation status under',
          subcontent: `Once generated, follow the instructions on the ${integrationName} Exports to confirm the export to ${integrationName}.`
        }
      default:
        return {
          title: 'Journal entries generation has started...',
          content: 'Monitor the journal entries generation status under',
          subcontent: `Once generated, follow the instructions on the ${integrationName} Exports to confirm the export to ${integrationName}.`
        }
    }
  }, [exportType])

  return (
    <BaseModal provider={provider} width="850">
      <BaseModal.Header>
        <BaseModal.Header.Title className="font-bold">{exportOnboardHandler.title}</BaseModal.Header.Title>
      </BaseModal.Header>
      <BaseModal.Body>
        <div className="w-[500px]">
          <Typography variant="heading3">What’s next?</Typography>
          <Typography variant="caption" classNames="mt-6 mb-4">
            {exportOnboardHandler.content} {/* eslint-disable react/jsx-curly-brace-presence */}
            <span style={{ fontWeight: 600 }}>{'"Exports" on the header.'}</span>
          </Typography>
          {isNewExportsCSVEnabled ? (
            <Image src={ExportsOnboardingImage} />
          ) : (
            <Image
              src={
                accountingIntegration?.integrationName === IntegrationName.QUICKBOOKS
                  ? QuickBooksExportOnboardingContent
                  : XeroExportOnboardingContent
              }
            />
          )}
          <Typography classNames="mt-6" variant="caption">
            {exportOnboardHandler.subcontent}
          </Typography>
        </div>
      </BaseModal.Body>
      <BaseModal.Footer>
        <BaseModal.Footer.SecondaryCTA classNames="w-[50%]" onClick={onClickDontShow} label="Don't show me again" />
        <BaseModal.Footer.PrimaryCTA classNames="w-[50%]" onClick={onClickOk} label="OK" />
      </BaseModal.Footer>
    </BaseModal>
  )
}

export default ExportOnboardModal
