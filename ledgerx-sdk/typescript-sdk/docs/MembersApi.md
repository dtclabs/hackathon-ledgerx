# MembersApi

All URIs are relative to *https://api.ledgerx.finance*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deactivateMember**](#deactivatemember) | **PUT** /deactivate/{id} | Deactivate a member|
|[**inviteMember**](#invitemember) | **POST** /invitations | Invite a new member|
|[**listMembers**](#listmembers) | **GET** /members | List organization members (paginated)|

# **deactivateMember**
> deactivateMember()


### Example

```typescript
import {
    MembersApi,
    Configuration
} from '@ledgerx/sdk';

const configuration = new Configuration();
const apiInstance = new MembersApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.deactivateMember(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | No Content |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **inviteMember**
> InviteMember201Response inviteMember(inviteMemberRequest)


### Example

```typescript
import {
    MembersApi,
    Configuration,
    InviteMemberRequest
} from '@ledgerx/sdk';

const configuration = new Configuration();
const apiInstance = new MembersApi(configuration);

let inviteMemberRequest: InviteMemberRequest; //

const { status, data } = await apiInstance.inviteMember(
    inviteMemberRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **inviteMemberRequest** | **InviteMemberRequest**|  | |


### Return type

**InviteMember201Response**

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

# **listMembers**
> ListMembers200Response listMembers()


### Example

```typescript
import {
    MembersApi,
    Configuration
} from '@ledgerx/sdk';

const configuration = new Configuration();
const apiInstance = new MembersApi(configuration);

let page: number; // (optional) (default to 0)
let size: number; // (optional) (default to 20)
let state: 'active' | 'deactivated' | ''; //Filter by state; leave empty to get all (optional) (default to undefined)

const { status, data } = await apiInstance.listMembers(
    page,
    size,
    state
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 0|
| **size** | [**number**] |  | (optional) defaults to 20|
| **state** | [**&#39;active&#39; | &#39;deactivated&#39; | &#39;&#39;**]**Array<&#39;active&#39; &#124; &#39;deactivated&#39; &#124; &#39;&#39;>** | Filter by state; leave empty to get all | (optional) defaults to undefined|


### Return type

**ListMembers200Response**

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

