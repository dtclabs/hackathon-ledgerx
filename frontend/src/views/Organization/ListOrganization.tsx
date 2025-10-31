/* eslint-disable react/no-array-index-key */
import Image from 'next/legacy/image'
import Link from 'next/link'
import { selectUserOrganizations } from '@/slice/organization/organization.selectors'
import { useAppSelector } from '@/state'

const ListOrganization = () => {
  const getOrganization = useAppSelector(selectUserOrganizations)

  return (
    <div className="border-t border-[#EAECF0] p-8 flex gap-6 justify-around flex-wrap max-h-[440px] overflow-y-auto overflow-x-hidden scrollbar ">
      {getOrganization.map((item) => (
        <Link key={item.publicId} href={`/${item.publicId}/dashboard`} legacyBehavior>
          <button
            type="button"
            data-test-id="organization"
            className="cursor-pointer shadow-3xl rounded bg-white hover:brightness-105"
          >
            <div className="flex justify-center">
              <Image width={250} height={145} src="/image/Frame.png" alt="frame" />
            </div>
            <p
              title={item.name}
              className="text-dashboard-main font-inter font-bold my-1 text-center text-lg max-w-[250px] truncate"
            >
              {item.name}
            </p>
          </button>
        </Link>
      ))}
    </div>
  )
}

export default ListOrganization
