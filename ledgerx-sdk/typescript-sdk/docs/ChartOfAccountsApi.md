# ChartOfAccountsApi

All URIs are relative to *https://api.ledgerx.finance*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createChartOfAccount**](#createchartofaccount) | **POST** /chart-of-accounts | Create a Chart of Account|
|[**listChartOfAccounts**](#listchartofaccounts) | **GET** /chart-of-accounts | List Chart of Accounts|
|[**listCoaMappings**](#listcoamappings) | **GET** /chart-of-accounts-mappings | List Chart of Accounts mappings|
|[**updateChartOfAccount**](#updatechartofaccount) | **PUT** /chart-of-accounts/{coaId} | Update a Chart of Account|

# **createChartOfAccount**
> CreateChartOfAccount201Response createChartOfAccount(createChartOfAccountRequest)


### Example

```typescript
import {
    ChartOfAccountsApi,
    Configuration,
    CreateChartOfAccountRequest
} from '@ledgerx/sdk';

const configuration = new Configuration();
const apiInstance = new ChartOfAccountsApi(configuration);

let createChartOfAccountRequest: CreateChartOfAccountRequest; //

const { status, data } = await apiInstance.createChartOfAccount(
    createChartOfAccountRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createChartOfAccountRequest** | **CreateChartOfAccountRequest**|  | |


### Return type

**CreateChartOfAccount201Response**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listChartOfAccounts**
> ListChartOfAccounts200Response listChartOfAccounts()


### Example

```typescript
import {
    ChartOfAccountsApi,
    Configuration
} from '@ledgerx/sdk';

const configuration = new Configuration();
const apiInstance = new ChartOfAccountsApi(configuration);

const { status, data } = await apiInstance.listChartOfAccounts();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ListChartOfAccounts200Response**

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

# **listCoaMappings**
> ListCoaMappings200Response listCoaMappings()


### Example

```typescript
import {
    ChartOfAccountsApi,
    Configuration
} from '@ledgerx/sdk';

const configuration = new Configuration();
const apiInstance = new ChartOfAccountsApi(configuration);

const { status, data } = await apiInstance.listCoaMappings();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**ListCoaMappings200Response**

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

# **updateChartOfAccount**
> updateChartOfAccount(updateChartOfAccountRequest)


### Example

```typescript
import {
    ChartOfAccountsApi,
    Configuration,
    UpdateChartOfAccountRequest
} from '@ledgerx/sdk';

const configuration = new Configuration();
const apiInstance = new ChartOfAccountsApi(configuration);

let coaId: string; // (default to undefined)
let updateChartOfAccountRequest: UpdateChartOfAccountRequest; //

const { status, data } = await apiInstance.updateChartOfAccount(
    coaId,
    updateChartOfAccountRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateChartOfAccountRequest** | **UpdateChartOfAccountRequest**|  | |
| **coaId** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No Content |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

