import { isAddress } from 'ethers/lib/utils'
import * as yup from 'yup'

export const amountSchemaForDrafts = yup.string().when('amount', {
  is: (val) => val && val !== '',
  then: yup
    .string()
    .test('checkMinimumAmount', 'Must be greater than 0', (value) => Number.isNaN(Number(value)) || Number(value) > 0)
    .matches(/^\d+\.?\d*$/, 'Please enter a valid amount'),
  otherwise: yup.string().nullable()
})

export const amountSchemaForReview = yup
  .string()
  .required('Amount is required.')
  .test('checkMinimumAmount', 'Must be greater than 0', (value) => Number.isNaN(Number(value)) || Number(value) > 0)
  .matches(/^\d+\.?\d*$/, 'Please enter a valid amount')

export const recipientSchema = yup
  .object()
  .shape({
    value: yup.string().ensure().required('Recipient is required.')
  })
  .required('Recipient is required.')
  .test('check-is-address', 'Invalid recipient address', (value) => isAddress(value?.address))
