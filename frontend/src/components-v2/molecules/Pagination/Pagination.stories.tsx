import React, { useState } from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Pagination } from './index'

export default {
  title: 'Molecules/Tables/Pagination',
  component: Pagination,
  argTypes: {
    backgroundColor: { control: 'color' }
  }
} as ComponentMeta<typeof Pagination>

const Template: ComponentStory<typeof Pagination> = (args) => {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 10000

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }
  return (
    <div className="flex font-inter">
      <Pagination
        onChangePageSize={() => console.log('change page size')}
        onClickLastPage={() => console.log('last page')}
        onClickFirstPage={() => console.log('first page')}
        onClickNextPage={() => console.log('next page')}
        currentPageSize={5}
        pageSizeOptions={[5, 10, 20]}
        canNextPage
        canPreviousPage
        onClickPreviousPage={() => console.log('prvious page')}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export const Default = Template.bind({})
// Default.args = {
//   isSyncing: false,
//   lastUpdated: '5 seconds ago'
// }
