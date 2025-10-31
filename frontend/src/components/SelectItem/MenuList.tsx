import { components, MenuListProps } from 'react-select'
import { IFormatOptionLabel } from './FormatOptionLabel'
import Button from '@/components-v2/atoms/Button'
import { useRouter } from 'next/router'
import { useOrganizationId } from '@/utils/getOrganizationId'

const CustomMenuList = (props: MenuListProps<IFormatOptionLabel>, hasImportCta = false) => {
  const router = useRouter()
  const organizationId = useOrganizationId()
  return (
    <>
      <components.MenuList {...props}>
        <div className="text-xs text-[#98A2B3] font-medium px-4 pt-2 pb-1">Select a wallet</div>
        {props.children}
      </components.MenuList>
      {hasImportCta && (
        <div className="w-full p-2 pb-1">
          <Button
            variant="whiteWithBlackBorder"
            classNames="text-[12px] w-full text-right"
            onClick={() => {
              router.push(`/${organizationId}/wallets/import`)
            }}
            height={24}
            label="Import Wallet"
          />
        </div>
      )}
    </>
  )
}

export default CustomMenuList
