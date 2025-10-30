# \WalletGroupsAPI

All URIs are relative to *https://api.ledgerx.finance*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateWalletGroup**](WalletGroupsAPI.md#CreateWalletGroup) | **Post** /wallet-groups | Create a new wallet group
[**ListWalletGroups**](WalletGroupsAPI.md#ListWalletGroups) | **Get** /wallet-groups | List wallet groups (paginated)
[**UpdateWalletGroup**](WalletGroupsAPI.md#UpdateWalletGroup) | **Put** /wallet-groups/{id} | Update a wallet group



## CreateWalletGroup

> ListWalletGroups200ResponseDataInner CreateWalletGroup(ctx).CreateWalletGroupRequest(createWalletGroupRequest).Execute()

Create a new wallet group

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	createWalletGroupRequest := *openapiclient.NewCreateWalletGroupRequest("Name_example", []string{"SupportedBlockchains_example"}) // CreateWalletGroupRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.WalletGroupsAPI.CreateWalletGroup(context.Background()).CreateWalletGroupRequest(createWalletGroupRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `WalletGroupsAPI.CreateWalletGroup``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateWalletGroup`: ListWalletGroups200ResponseDataInner
	fmt.Fprintf(os.Stdout, "Response from `WalletGroupsAPI.CreateWalletGroup`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateWalletGroupRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createWalletGroupRequest** | [**CreateWalletGroupRequest**](CreateWalletGroupRequest.md) |  | 

### Return type

[**ListWalletGroups200ResponseDataInner**](ListWalletGroups200ResponseDataInner.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListWalletGroups

> ListWalletGroups200Response ListWalletGroups(ctx).Page(page).Limit(limit).Execute()

List wallet groups (paginated)

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	page := int32(56) // int32 |  (optional) (default to 0)
	limit := int32(56) // int32 |  (optional) (default to 20)

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.WalletGroupsAPI.ListWalletGroups(context.Background()).Page(page).Limit(limit).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `WalletGroupsAPI.ListWalletGroups``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListWalletGroups`: ListWalletGroups200Response
	fmt.Fprintf(os.Stdout, "Response from `WalletGroupsAPI.ListWalletGroups`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiListWalletGroupsRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | **int32** |  | [default to 0]
 **limit** | **int32** |  | [default to 20]

### Return type

[**ListWalletGroups200Response**](ListWalletGroups200Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## UpdateWalletGroup

> UpdateWalletGroup(ctx, id).UpdateWalletGroupRequest(updateWalletGroupRequest).Execute()

Update a wallet group

### Example

```go
package main

import (
	"context"
	"fmt"
	"os"
	openapiclient "github.com/GIT_USER_ID/GIT_REPO_ID"
)

func main() {
	id := "id_example" // string | 
	updateWalletGroupRequest := *openapiclient.NewUpdateWalletGroupRequest("Name_example") // UpdateWalletGroupRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.WalletGroupsAPI.UpdateWalletGroup(context.Background(), id).UpdateWalletGroupRequest(updateWalletGroupRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `WalletGroupsAPI.UpdateWalletGroup``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**id** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiUpdateWalletGroupRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **updateWalletGroupRequest** | [**UpdateWalletGroupRequest**](UpdateWalletGroupRequest.md) |  | 

### Return type

 (empty response body)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

