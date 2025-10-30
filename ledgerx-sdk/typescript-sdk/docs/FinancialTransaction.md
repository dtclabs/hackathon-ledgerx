# FinancialTransaction


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**hash** | **string** |  | [optional] [default to undefined]
**blockchainId** | **string** |  | [optional] [default to undefined]
**fromAddress** | **string** |  | [optional] [default to undefined]
**toAddress** | **string** |  | [optional] [default to undefined]
**proxyAddress** | **string** |  | [optional] [default to undefined]
**cryptocurrency** | [**Cryptocurrency**](Cryptocurrency.md) |  | [optional] [default to undefined]
**cryptocurrencyAmount** | **string** |  | [optional] [default to undefined]
**valueTimestamp** | **string** |  | [optional] [default to undefined]
**type** | **string** |  | [optional] [default to undefined]
**typeDetail** | [**FinancialTransactionTypeDetail**](FinancialTransactionTypeDetail.md) |  | [optional] [default to undefined]
**status** | **string** |  | [optional] [default to undefined]
**substatuses** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**costBasis** | **number** |  | [optional] [default to undefined]
**fiatAmount** | **number** | Fiat value (can be null if not available) | [optional] [default to undefined]
**fiatAmountPerUnit** | **number** |  | [optional] [default to undefined]
**fiatCurrency** | **string** |  | [optional] [default to undefined]
**gainLoss** | **number** |  | [optional] [default to undefined]
**direction** | **string** |  | [optional] [default to undefined]
**note** | **string** |  | [optional] [default to undefined]
**invoiceId** | **string** |  | [optional] [default to undefined]
**category** | **string** |  | [optional] [default to undefined]
**correspondingChartOfAccount** | **string** |  | [optional] [default to undefined]
**financialTransactionParent** | [**FinancialTransactionParent**](FinancialTransactionParent.md) |  | [optional] [default to undefined]
**fromContact** | [**Contact**](Contact.md) |  | [optional] [default to undefined]
**toContact** | [**Contact**](Contact.md) |  | [optional] [default to undefined]

## Example

```typescript
import { FinancialTransaction } from '@ledgerx/sdk';

const instance: FinancialTransaction = {
    id,
    hash,
    blockchainId,
    fromAddress,
    toAddress,
    proxyAddress,
    cryptocurrency,
    cryptocurrencyAmount,
    valueTimestamp,
    type,
    typeDetail,
    status,
    substatuses,
    costBasis,
    fiatAmount,
    fiatAmountPerUnit,
    fiatCurrency,
    gainLoss,
    direction,
    note,
    invoiceId,
    category,
    correspondingChartOfAccount,
    financialTransactionParent,
    fromContact,
    toContact,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
