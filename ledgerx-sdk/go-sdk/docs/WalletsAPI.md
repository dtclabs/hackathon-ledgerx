# \WalletsAPI

All URIs are relative to *https://api.ledgerx.finance*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ImportWallets**](WalletsAPI.md#ImportWallets) | **Post** /wallets | Import and sync wallets
[**ListWallets**](WalletsAPI.md#ListWallets) | **Get** /wallets | Get list of wallets



## ImportWallets

> ImportWallets200Response ImportWallets(ctx).ImportWalletsRequest(importWalletsRequest).Execute()

Import and sync wallets

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
	importWalletsRequest := *openapiclient.NewImportWalletsRequest([]string{"Wallets_example"}) // ImportWalletsRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.WalletsAPI.ImportWallets(context.Background()).ImportWalletsRequest(importWalletsRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `WalletsAPI.ImportWallets``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ImportWallets`: ImportWallets200Response
	fmt.Fprintf(os.Stdout, "Response from `WalletsAPI.ImportWallets`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiImportWalletsRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **importWalletsRequest** | [**ImportWalletsRequest**](ImportWalletsRequest.md) |  | 

### Return type

[**ImportWallets200Response**](ImportWallets200Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListWallets

> WalletListResponse ListWallets(ctx).Page(page).Limit(limit).Execute()

Get list of wallets

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
	resp, r, err := apiClient.WalletsAPI.ListWallets(context.Background()).Page(page).Limit(limit).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `WalletsAPI.ListWallets``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListWallets`: WalletListResponse
	fmt.Fprintf(os.Stdout, "Response from `WalletsAPI.ListWallets`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiListWalletsRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | **int32** |  | [default to 0]
 **limit** | **int32** |  | [default to 20]

### Return type

[**WalletListResponse**](WalletListResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

