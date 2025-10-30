# WalletsApi

All URIs are relative to *https://api.ledgerx.finance*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**importWallets**](#importwallets) | **POST** /wallets | Import and sync wallets|
|[**listWallets**](#listwallets) | **GET** /wallets | Get list of wallets|

# **importWallets**
> ImportWallets200Response importWallets(importWalletsRequest)


### Example

```typescript
import {
    WalletsApi,
    Configuration,
    ImportWalletsRequest
} from '@ledgerx/sdk';

const configuration = new Configuration();
const apiInstance = new WalletsApi(configuration);

let importWalletsRequest: ImportWalletsRequest; //

const { status, data } = await apiInstance.importWallets(
    importWalletsRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **importWalletsRequest** | **ImportWalletsRequest**|  | |


### Return type

**ImportWallets200Response**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Job IDs created for each wallet sync |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listWallets**
> WalletListResponse listWallets()


### Example

```typescript
import {
    WalletsApi,
    Configuration
} from '@ledgerx/sdk';

const configuration = new Configuration();
const apiInstance = new WalletsApi(configuration);

let page: number; // (optional) (default to 0)
let limit: number; // (optional) (default to 20)

const { status, data } = await apiInstance.listWallets(
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

**WalletListResponse**

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

