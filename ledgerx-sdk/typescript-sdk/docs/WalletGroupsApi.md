# WalletGroupsApi

All URIs are relative to *https://api.ledgerx.finance*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createWalletGroup**](#createwalletgroup) | **POST** /wallet-groups | Create a new wallet group|
|[**listWalletGroups**](#listwalletgroups) | **GET** /wallet-groups | List wallet groups (paginated)|
|[**updateWalletGroup**](#updatewalletgroup) | **PUT** /wallet-groups/{id} | Update a wallet group|

# **createWalletGroup**
> ListWalletGroups200ResponseDataInner createWalletGroup(createWalletGroupRequest)


### Example

```typescript
import {
    WalletGroupsApi,
    Configuration,
    CreateWalletGroupRequest
} from '@ledgerx/sdk';

const configuration = new Configuration();
const apiInstance = new WalletGroupsApi(configuration);

let createWalletGroupRequest: CreateWalletGroupRequest; //

const { status, data } = await apiInstance.createWalletGroup(
    createWalletGroupRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **createWalletGroupRequest** | **CreateWalletGroupRequest**|  | |


### Return type

**ListWalletGroups200ResponseDataInner**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listWalletGroups**
> ListWalletGroups200Response listWalletGroups()


### Example

```typescript
import {
    WalletGroupsApi,
    Configuration
} from '@ledgerx/sdk';

const configuration = new Configuration();
const apiInstance = new WalletGroupsApi(configuration);

let page: number; // (optional) (default to 0)
let limit: number; // (optional) (default to 20)

const { status, data } = await apiInstance.listWalletGroups(
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

**ListWalletGroups200Response**

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

# **updateWalletGroup**
> updateWalletGroup(updateWalletGroupRequest)


### Example

```typescript
import {
    WalletGroupsApi,
    Configuration,
    UpdateWalletGroupRequest
} from '@ledgerx/sdk';

const configuration = new Configuration();
const apiInstance = new WalletGroupsApi(configuration);

let id: string; // (default to undefined)
let updateWalletGroupRequest: UpdateWalletGroupRequest; //

const { status, data } = await apiInstance.updateWalletGroup(
    id,
    updateWalletGroupRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateWalletGroupRequest** | **UpdateWalletGroupRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


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

