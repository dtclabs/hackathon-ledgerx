# FinancialTransactionsApi

All URIs are relative to *https://api.ledgerx.finance*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**listFinancialTransactions**](#listfinancialtransactions) | **GET** /financial-transactions | List financial transactions (paginated)|

# **listFinancialTransactions**
> FinancialTransactionsResponse listFinancialTransactions()


### Example

```typescript
import {
    FinancialTransactionsApi,
    Configuration
} from '@ledgerx/sdk';

const configuration = new Configuration();
const apiInstance = new FinancialTransactionsApi(configuration);

let page: number; // (optional) (default to 0)
let limit: number; // (optional) (default to 20)

const { status, data } = await apiInstance.listFinancialTransactions(
    page,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 0|
| **limit** | [**number**] |  | (optional) defaults to 20|


### Return type

**FinancialTransactionsResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

