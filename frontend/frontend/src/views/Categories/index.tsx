import { ICategories } from '@/slice/categories/interfaces'
import NotificationPopUp from '@/components/NotificationPopUp/NotificationPopUp'
import { useDebounce } from '@/hooks/useDebounce'
import { useAppSelector } from '@/state'
import { Input } from '@/components-v2'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { toShort } from '@/utils/toShort'
import React, { useEffect, useState } from 'react'
import { EProcessStatus } from '../Organization/interface'
import CategoryList from './components/CategoryList/CategoryList'
import CreateNewCategory from './components/CreateNewCategory'
import FilterCategoryList from './components/FilterCategoryList'
import ImportCategory from './components/ImportCategory/ImportCategory'
import categoryIcon from '@/public/svg/Document.svg'
import DividerVertical from '@/components/DividerVertical/DividerVertical'
import { TablePagination } from '@/components/TablePagination'
import {
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  usePostCategoryMutation,
  useReplaceCategoriesMutation
} from '@/api-v2/categories-api'
import { showBannerSelector } from '@/slice/platform/platform-slice'
import { AuthenticatedView as View, Header } from '@/components-v2/templates/AuthenticatedView'
import NotFound from '@/components/NotFound'

export const options = [
  { key: 'Append', name: 'Append to existing category list' },
  { key: 'Replace', name: 'Replace current category list' }
]
const Categories = () => {
  const size = process.env.NEXT_PUBLIC_MAXIMUM_TRANSACTIONS_HISTORY || '20'
  // Hooks
  const [page, setPage] = useState(0)
  const [textSearch, setTextSearch] = useState('')
  const [isExistData, setIsExistData] = useState(false)
  // Custom hook and contextAPI
  const showBanner = useAppSelector(showBannerSelector)
  const [name, setName] = useState('')
  const organizationId = useOrganizationId()
  const { debouncedValue: search } = useDebounce(textSearch, 500)
  const [isShowDelete, setIsShowDelete] = useState(false)
  const [showAddNewCategoryModal, setShowAddNewCategoryModal] = useState(false)
  const [error, setError] = useState<string>()
  const [status, setStatus] = useState<EProcessStatus>(EProcessStatus.PENDING)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ICategories>()
  const [idCategoryDelete, setIdCategoryDelete] = useState<string>()
  const [action, setAction] = useState<string>()
  const [showImportCategoryModal, setShowImportCategoryModal] = useState(false)
  const [csvData, setCSVData] = useState<any[]>([])
  const [option, setOption] = useState(options[0].name)
  const [showDropdown, setShowDropDown] = useState(false)
  const [filterData, setFilterData] = useState<string[]>([])
  const { data: categories } = useGetCategoriesQuery({
    orgId: organizationId,
    params: {
      size: Number(size),
      page,
      search,
      type: filterData.join(),
      order: 'code',
      direction: 'ASC'
    }
  })
  const [total, setTotal] = useState<number>(categories?.totalItems)

  const { data: fullyCategories } = useGetCategoriesQuery(
    {
      orgId: organizationId,
      params: {
        size: 999
      }
    },
    { skip: !organizationId }
  )

  const [deleteCategory, deleteCategoryResult] = useDeleteCategoryMutation()
  const [replaceCategories, replaceCategoriesResult] = useReplaceCategoriesMutation()
  const [postCategory] = usePostCategoryMutation()

  useEffect(() => {
    if (deleteCategoryResult.isError) {
      setStatus(EProcessStatus.FAILED)
      setError(deleteCategoryResult.error.data.message)
    }
    if (deleteCategoryResult.isSuccess) {
      setStatus(EProcessStatus.SUCCESS)
      setError('')
    }
  }, [deleteCategoryResult.isError, deleteCategoryResult.isSuccess])

  useEffect(() => {
    if (replaceCategoriesResult.isError) {
      setStatus(EProcessStatus.FAILED)
      setError(replaceCategoriesResult.error.data.message)
    }
    if (replaceCategoriesResult.isSuccess) {
      setStatus(EProcessStatus.SUCCESS)
      setError('')
    }
  }, [replaceCategoriesResult.isError, replaceCategoriesResult.isSuccess])

  useEffect(() => {
    if (status === EProcessStatus.PENDING) {
      setShowErrorModal(false)
      setShowSuccessModal(false)
      setIsShowDelete(false)
    } else if (status === EProcessStatus.SUCCESS) {
      setShowSuccessModal(true)
      setShowAddNewCategoryModal(false)
      setIsShowDelete(false)
      if (action === 'ADD') {
        setTotal((prev) => prev + 1)
      }
      if (action === 'DELETE') {
        setTotal((prev) => prev - 1)
      }
    } else if (status === EProcessStatus.FAILED) {
      setShowAddNewCategoryModal(false)
      setShowErrorModal(true)
      setIsShowDelete(false)
      // setIsShowEditModal(false)
    }
  }, [status])

  // reset page when delete
  useEffect(() => {
    if (total % Number(size) === 0 && action === 'DELETE') {
      setPage(0)
    }
  }, [total])

  useEffect(() => {
    if (!search && filterData.length === 0) {
      setTotal(categories?.totalItems)
    }
  }, [categories])

  useEffect(() => {
    if (categories && categories.items && categories.items.length > 0) {
      setIsExistData(true)
    }
    if (total === 0) {
      setIsExistData(false)
    }
  }, [categories, total])

  //   Handle search
  const handleChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0)
    setTextSearch(e.target.value)
  }
  const handleReset = () => {
    setTextSearch('')
  }
  const handleDecline = () => {
    setIsShowDelete(false)
  }
  const handleAccept = async () => {
    if (action === 'DELETE') {
      deleteCategory({
        orgId: organizationId,
        payload: {
          id: idCategoryDelete
        }
      })
    }
  }

  const onShowAddCategory = () => {
    // add category
    setSelectedCategory(null)
    setShowAddNewCategoryModal(true)
    setAction('ADD')
  }

  const handleShowImport = () => {
    setAction('IMPORT')
    setShowImportCategoryModal(true)
  }

  const handleImportCategories = async (list: any[]) => {
    setPage(0)
    if (option === 'Append to existing category list') {
      setTotal((prev) => prev + list.length)
      for (let i = 0; i < list.length; i++) {
        await postCategory({
          orgId: organizationId,
          payload: {
            name: list[i][1],
            type: list[i][2] || null,
            code: list[i][0] || null,
            description: list[i][3] || null
          }
        })
      }
      setStatus(EProcessStatus.SUCCESS)
    } else if (option === 'Replace current category list') {
      setTotal(list.length)
      replaceCategories({
        orgId: organizationId,
        payload: list.map((category) => ({
          name: category[1],
          type: category[2] || null,
          code: category[0] || null,
          description: category[3] || null
        }))
      })
    }
  }

  return (
    <>
      <Header>
        <Header.Left>
          <Header.Left.Title>Categories</Header.Left.Title>
        </Header.Left>
        <Header.Right>
          <Header.Right.SecondaryCTA label="Import .CSV" onClick={handleShowImport} />
          <Header.Right.PrimaryCTA label="Add Category" onClick={onShowAddCategory} />
        </Header.Right>
      </Header>

      <View.Content>
        {isExistData ? (
          <>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2 w-full">
                <div className="w-1/4">
                  <div className="flex items-center">
                    <Input
                      placeholder="Search by category code or name"
                      id="wallet-search"
                      onChange={handleChangeText}
                      isSearch
                      classNames="h-[34px] text-sm"
                    />
                  </div>
                </div>
                <DividerVertical />
                <FilterCategoryList setFilterData={setFilterData} filterData={filterData} setPage={setPage} />
              </div>
            </div>
            <div>
              <CategoryList
                categories={categories?.items || []}
                setShowAddNewCategoryModal={setShowAddNewCategoryModal}
                setSelectedCategory={setSelectedCategory}
                setAction={setAction}
                setIsShowDelete={setIsShowDelete}
                setIdCategoryDelete={setIdCategoryDelete}
              />
            </div>
            {categories?.items?.length ? (
              <div className="mt-4 flex justify-start">
                <TablePagination
                  totalItems={Number(categories?.totalItems)}
                  totalPages={Number(categories?.totalPages)}
                  size={Number(size)}
                  currentPage={page}
                  setPage={setPage}
                  canPreviousPage={page > 0}
                  canNextPage={page < Number(categories?.totalPages) - 1}
                  onePageForward={() => {
                    setPage(page + 1)
                  }}
                  onePageBack={() => {
                    setPage(page - 1)
                  }}
                />
              </div>
            ) : null}
          </>
        ) : (
          <div
            className={`my-0 mx-auto ${
              showBanner ? 'h-[calc(100vh-286px)]' : 'h-[calc(100vh-218px)]'
            } flex justify-center items-center flex-col`}
          >
            <NotFound
              title="Don’t see any categories yet?"
              subTitle="Add new category to get started"
              icon={categoryIcon}
              onClick={onShowAddCategory}
              label="Create a Category"
              height={32}
              width={32}
              className="bg-grey-200 mb-16 text-sm rounded-[4px] py-[14px] px-8 text-grey-800"
            />
          </div>
        )}
      </View.Content>
      <CreateNewCategory
        setName={setName}
        setError={setError}
        setStatus={setStatus}
        showModal={showAddNewCategoryModal}
        setShowModal={setShowAddNewCategoryModal}
        selectedCategory={selectedCategory}
        action={action}
      />
      <ImportCategory
        option={option}
        setOption={setOption}
        options={options}
        onSubmit={handleImportCategories}
        categories={fullyCategories}
        showModal={showImportCategoryModal}
        setShowModal={setShowImportCategoryModal}
        csvData={csvData}
        setCSVData={setCSVData}
      />
      {isShowDelete && (
        <NotificationPopUp
          title={action === 'DELETE' && 'Delete Category?'}
          firstText={action === 'DELETE' && 'You are about to delete the category,'}
          boldText={action === 'DELETE' && ` “${selectedCategory?.name}”`}
          lastText={action === 'DELETE' && '. You may add this category again later.'}
          type="custom"
          image="/svg/warningBig.svg"
          option
          setShowModal={setIsShowDelete}
          showModal={isShowDelete}
          declineText={action === 'DELETE' && 'No, Don’t Delete'}
          acceptText={action === 'DELETE' && 'Yes, Delete'}
          onClose={handleDecline}
          onAccept={handleAccept}
        />
      )}
      {showSuccessModal && (
        <NotificationPopUp
          title={
            (action === 'IMPORT' && 'Categories successfully imported!') ||
            (action === 'EDIT' && 'The category has been edited successfully') ||
            (action === 'ADD' && 'New category successfully added!') ||
            (action === 'DELETE' && 'The category has been deleted successfully')
          }
          description={action === 'IMPORT' && 'You have successfully added the categories from CSV to the list.'}
          firstText={
            (action === 'ADD' && 'You have successfully added') || (action === 'EDIT' && 'You have successfully edited')
          }
          lastText={(action === 'ADD' && 'to your category list.') || (action === 'EDIT' && 'category')}
          boldText={(action === 'ADD' || action === 'EDIT') && ` “${name.length > 20 ? toShort(name, 20, 0) : name}” `}
          type={action === 'IMPORT' ? 'custom' : 'success'}
          image={action === 'IMPORT' && '/svg/ImportSuccess.svg'}
          setShowModal={setShowSuccessModal}
          showModal={showSuccessModal}
          onClose={() => {
            setStatus(EProcessStatus.PENDING)
          }}
          option={action === 'ADD' || action === 'IMPORT'}
          declineText="Skip"
          acceptText={(action === 'ADD' && 'Add Another category') || (action === 'IMPORT' && 'Import Another CSV')}
          onAccept={() => {
            setStatus(EProcessStatus.PENDING)
            if (action === 'ADD') setShowAddNewCategoryModal(true)
            if (action === 'IMPORT') {
              setShowImportCategoryModal(true)
            }
          }}
        />
      )}

      {showErrorModal && (
        <NotificationPopUp
          type="error"
          title={error.includes('existed') ? 'Category Already Exists' : 'Warning'}
          boldText={error.includes('existed') && `“${name}” `}
          lastText="category has already been added. Please try adding another category or edit the existing category details."
          onClose={() => {
            setShowErrorModal(false)
            setStatus(EProcessStatus.PENDING)
            setError(undefined)
          }}
          acceptText="Dismiss"
          setShowModal={setShowErrorModal}
          showModal={showErrorModal}
        />
      )}
    </>
  )
}

export default Categories
