# SyncApi

All URIs are relative to *https://api.ledgerx.finance*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createSyncJob**](#createsyncjob) | **POST** /sync | Request to sync a wallet|
|[**getSyncStatus**](#getsyncstatus) | **GET** /sync | Check sync job status|
|[**updateSyncJob**](#updatesyncjob) | **PUT** /sync/{jobId} | Pause or continue a sync job|

# **createSyncJob**
> SyncPostResponse createSyncJob(syncPostRequest)

Free for first 10,000 transactions, then costs **0.5 CU** per additional transaction.

### Example

```typescript
import {
    SyncApi,
    Configuration,
    SyncPostRequest
} from '@ledgerx/sdk';

const configuration = new Configuration();
const apiInstance = new SyncApi(configuration);

let syncPostRequest: SyncPostRequest; //

const { status, data } = await apiInstance.createSyncJob(
    syncPostRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **syncPostRequest** | **SyncPostRequest**|  | |


### Return type

**SyncPostResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**202** | Sync job created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSyncStatus**
> SyncGetResponse getSyncStatus()


### Example

```typescript
import {
    SyncApi,
    Configuration
} from '@ledgerx/sdk';

const configuration = new Configuration();
const apiInstance = new SyncApi(configuration);

let jobId: string; //Sync job identifier (default to undefined)

const { status, data } = await apiInstance.getSyncStatus(
    jobId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **jobId** | [**string**] | Sync job identifier | defaults to undefined|


### Return type

**SyncGetResponse**

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |
|**400** | Missing or invalid jobId |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateSyncJob**
> updateSyncJob(syncPutRequest)


### Example

```typescript
import {
    SyncApi,
    Configuration,
    SyncPutRequest
} from '@ledgerx/sdk';

const configuration = new Configuration();
const apiInstance = new SyncApi(configuration);

let jobId: string; // (default to undefined)
let syncPutRequest: SyncPutRequest; //

const { status, data } = await apiInstance.updateSyncJob(
    jobId,
    syncPutRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **syncPutRequest** | **SyncPutRequest**|  | |
| **jobId** | [**string**] |  | defaults to undefined|


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

