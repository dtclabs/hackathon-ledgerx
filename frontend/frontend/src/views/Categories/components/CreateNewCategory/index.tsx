import NewFilterDropDown from '@/components/DropDown/NewFilterDropDown'
import Modal from '@/components/Modal'
import { IModal } from '@/components/Modal/interface'
import TextField from '@/components/TextField/TextField'
import { EProcessStatus } from '@/views/Organization/interface'
import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useOrganizationId } from '@/utils/getOrganizationId'
import { CategoryType, ICategories } from '@/slice/categories/interfaces'
import Image from 'next/legacy/image'
import warning from '@/assets/svg/warning.svg'
import { useEditCategoryMutation, usePostCategoryMutation } from '@/api-v2/categories-api'

interface IAddNewCategoryModal extends IModal {
  setStatus: (status: EProcessStatus) => void
  setError: (error: string) => void
  setName: (name: string) => void
  selectedCategory: ICategories
  action: string
}
export interface ICategory {
  code: string
  name: string
  description?: string
}

const CreateNewCategory: React.FC<IAddNewCategoryModal> = ({
  setShowModal,
  showModal,
  setError,
  setName,
  setStatus,
  selectedCategory,
  action
}) => {
  // const loading = useAppSelector(categorySelectors.loadingSelector)
  const [addCategory, addCategoryResult] = usePostCategoryMutation()
  const [editCategory, editCategoryResult] = useEditCategoryMutation()

  const submitRef = useRef(null)
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    reset
  } = useForm<ICategory>({
    defaultValues: {
      code: (selectedCategory && selectedCategory.code) || '',
      name: (selectedCategory && selectedCategory.name) || '',
      description: (selectedCategory && selectedCategory.description) || ''
    }
  })
  const [selectType, setSelectType] = useState<CategoryType>(selectedCategory && selectedCategory.type)
  const [submit, setSubmit] = useState(false)
  const organizationId = useOrganizationId()
  const onSubmit = (data: ICategory) => {
    if (action === 'ADD' && selectType)
      addCategory({
        orgId: organizationId,
        payload: {
          name: data?.name?.trim(),
          type: selectType,
          code: data?.code?.trim(),
          description: data?.description?.trim() || null
        }
      })
    else if (action === 'EDIT')
      editCategory({
        orgId: organizationId,
        id: selectedCategory.id,
        payload: {
          name: data?.name.trim(),
          type: selectType,
          code: data?.code.trim(),
          description: data?.description.trim() || null
        }
      })
    setName(data.name.trim())
  }

  useEffect(() => {
    if (addCategoryResult.isLoading) {
      setStatus(EProcessStatus.PENDING)
    }
    if (addCategoryResult.isSuccess) {
      setStatus(EProcessStatus.SUCCESS)
    }
    if (addCategoryResult.isError) {
      setStatus(EProcessStatus.FAILED)
      setError(addCategoryResult.error.data.message)
    }
  }, [addCategoryResult])

  useEffect(() => {
    if (editCategoryResult.isLoading) {
      setStatus(EProcessStatus.PENDING)
    }
    if (editCategoryResult.isSuccess) {
      setStatus(EProcessStatus.SUCCESS)
    }
    if (editCategoryResult.isError) {
      setStatus(EProcessStatus.FAILED)
      setError(editCategoryResult.error.data.message)
    }
  }, [editCategoryResult])

  useEffect(() => {
    if (showModal) {
      reset({
        code: (selectedCategory && selectedCategory.code) || '',
        name: (selectedCategory && selectedCategory.name) || '',
        description: (selectedCategory && selectedCategory.description) || ''
      })
      setSelectType((selectedCategory && selectedCategory.type) || undefined)
      setSubmit(false)
    }
  }, [reset, selectedCategory, showModal])

  return (
    <Modal setShowModal={setShowModal} showModal={showModal}>
      <form
        onSubmit={handleSubmit((data) => {
          if (!addCategoryResult.isLoading || !editCategoryResult.isLoading) {
            onSubmit(data)
          }
        })}
        className="w-[600px] bg-white rounded-2xl shadow-home-modal font-inter"
      >
        <div className="p-8">
          <div>
            <div className="flex justify-between items-center ">
              <h1 className="text-dashboard-main text-2xl ">
                {(action === 'ADD' && 'Add New Category') || (action === 'EDIT' && 'Edit Category')}
              </h1>
              <button type="button" onClick={() => setShowModal(false)}>
                <img src="/svg/BigClose.svg" alt="BigClose" />
              </button>
            </div>
            <p className="font-medium text-[#667085] text-sm pt-1">
              {action === 'ADD' && 'This adds a new category to the category list.'}
              {action === 'EDIT' && 'This edits the details of the selected category.'}
            </p>
          </div>
        </div>
        <div className="p-8  border-t">
          <div className="pb-4">
            <h2 className="text-sm font-medium text-dashboard-main tracking-wide mb-2 ">Type</h2>
            <NewFilterDropDown
              width="w-full focus:shadow-wallet rounded-lg"
              triggerButton={
                <div className=" bg-grey-100 flex items-center justify-between w-full h-[48px] py-2 px-4 text-sm text-dashboard-main rounded-md focus:outline-none leading-5 border border-blanca-300">
                  {selectType || <div className="text-grey-700 italic">Select Category Type</div>}
                  <div className="bg-dashboard-border-200 cursor-pointer flex justify-between items-center w-fit h-fit py-[10px] px-2 rounded-sm flex-shrink-0">
                    <img src="/svg/Dropdown.svg" alt="DownArrow" className="w-3 h-auto" />
                  </div>
                </div>
              }
            >
              <div className="max-h-[200px] overflow-y-auto scrollbar">
                {Object.values(CategoryType)
                  .sort()
                  .map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => {
                        setSelectType(item)
                      }}
                      className="text-gray-700 flex justify-between items-center bg-white w-full h-[48px] py-2 px-4 capitalize text-sm text-left hover:bg-grey-100 font-inter"
                    >
                      {item}
                      {selectType === item && <img src="/svg/PinkTick.svg" alt="PinkTick" className="w-auto h-4" />}
                    </button>
                  ))}
              </div>
            </NewFilterDropDown>
            {submit && !selectType && (
              <div className="text-sm font-inter pt-1 flex items-center text-[#E83F6D] ">
                <div className="mr-2 flex items-center">
                  <Image src={warning} alt="warning" />
                </div>
                This field is required.
              </div>
            )}
          </div>
          <div className="pb-4">
            <h2 className="text-sm font-medium text-dashboard-main tracking-wide mb-2">Code</h2>
            <TextField
              control={control}
              errors={errors}
              errorClass="mt-1"
              extendInputClassName="placeholder:italic placeholder:text-grey-700 text-dashboard-main"
              name="code"
              placeholder="e.g. 326"
              rules={{
                maxLength: {
                  value: 50,
                  message: 'Category Code allows maximum of 50 characters.'
                },
                required: {
                  value: true,
                  message: 'This field is required.'
                },
                validate: {
                  require: (value: string) => (value && value.trim().length !== 0) || 'This field is required.',
                  validateCode: (value: string) =>
                    (value && /^[0-9]+$/i.test(value.trim())) ||
                    'This field allows only numeric input with no blank spaces.'
                }
              }}
            />
          </div>
          <div className="pb-4">
            <h2 className="text-sm font-medium text-dashboard-main tracking-wide mb-2">Name</h2>
            <TextField
              control={control}
              errors={errors}
              extendInputClassName="placeholder:italic placeholder:text-grey-700"
              errorClass="mt-1"
              name="name"
              placeholder="e.g. Advertising"
              rules={{
                maxLength: {
                  value: 250,
                  message: 'Category Name allows maximum of 250 characters.'
                },
                required: {
                  value: true,
                  message: 'This field is required.'
                },
                validate: (value: string) => (value && value.trim().length !== 0) || 'This field is required.'
              }}
            />
          </div>
          <div>
            <h2 className="text-sm font-medium text-dashboard-main tracking-wide mb-2">Description (optional)</h2>
            <TextField
              errors={errors}
              errorClass="mt-1"
              rules={{
                maxLength: {
                  value: 1000,
                  message: 'Description allows maximum of 1000 characters.'
                }
              }}
              control={control}
              name="description"
              multiline
              rows={3}
              extendInputClassName="placeholder:italic placeholder:text-grey-700"
              placeholder="e.g. Expenses incurred for advertising while trying to increase sales"
            />
          </div>
        </div>
        <div className="p-8 gap-4 flex border-t">
          <button
            onClick={() => {
              setShowModal(false)
            }}
            type="button"
            className=" py-4 px-8 font-semibold  rounded-lg text-base hover:bg-gray-200 text-dashboard-main font-inter bg-[#F2F4F7]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setSubmit(true)
            }}
            ref={submitRef}
            disabled={isSubmitting && !selectType}
            type="submit"
            className=" py-4 cursor-pointer  w-full text-center font-semibold rounded-lg text-base hover:opacity-90 text-white font-inter bg-grey-900 disabled:opacity-80 hover:bg-grey-901"
          >
            {action === 'ADD' && 'Add New Category'}
            {action === 'EDIT' && 'Save Category'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateNewCategory
