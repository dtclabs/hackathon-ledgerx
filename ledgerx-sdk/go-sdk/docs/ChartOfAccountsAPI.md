# \ChartOfAccountsAPI

All URIs are relative to *https://api.ledgerx.finance*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateChartOfAccount**](ChartOfAccountsAPI.md#CreateChartOfAccount) | **Post** /chart-of-accounts | Create a Chart of Account
[**ListChartOfAccounts**](ChartOfAccountsAPI.md#ListChartOfAccounts) | **Get** /chart-of-accounts | List Chart of Accounts
[**ListCoaMappings**](ChartOfAccountsAPI.md#ListCoaMappings) | **Get** /chart-of-accounts-mappings | List Chart of Accounts mappings
[**UpdateChartOfAccount**](ChartOfAccountsAPI.md#UpdateChartOfAccount) | **Put** /chart-of-accounts/{coaId} | Update a Chart of Account



## CreateChartOfAccount

> CreateChartOfAccount201Response CreateChartOfAccount(ctx).CreateChartOfAccountRequest(createChartOfAccountRequest).Execute()

Create a Chart of Account

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
	createChartOfAccountRequest := *openapiclient.NewCreateChartOfAccountRequest("Code_example", "Name_example", "Type_example") // CreateChartOfAccountRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.ChartOfAccountsAPI.CreateChartOfAccount(context.Background()).CreateChartOfAccountRequest(createChartOfAccountRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `ChartOfAccountsAPI.CreateChartOfAccount``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `CreateChartOfAccount`: CreateChartOfAccount201Response
	fmt.Fprintf(os.Stdout, "Response from `ChartOfAccountsAPI.CreateChartOfAccount`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiCreateChartOfAccountRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **createChartOfAccountRequest** | [**CreateChartOfAccountRequest**](CreateChartOfAccountRequest.md) |  | 

### Return type

[**CreateChartOfAccount201Response**](CreateChartOfAccount201Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListChartOfAccounts

> ListChartOfAccounts200Response ListChartOfAccounts(ctx).Execute()

List Chart of Accounts

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

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.ChartOfAccountsAPI.ListChartOfAccounts(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `ChartOfAccountsAPI.ListChartOfAccounts``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListChartOfAccounts`: ListChartOfAccounts200Response
	fmt.Fprintf(os.Stdout, "Response from `ChartOfAccountsAPI.ListChartOfAccounts`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiListChartOfAccountsRequest struct via the builder pattern


### Return type

[**ListChartOfAccounts200Response**](ListChartOfAccounts200Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ListCoaMappings

> ListCoaMappings200Response ListCoaMappings(ctx).Execute()

List Chart of Accounts mappings

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

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	resp, r, err := apiClient.ChartOfAccountsAPI.ListCoaMappings(context.Background()).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `ChartOfAccountsAPI.ListCoaMappings``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListCoaMappings`: ListCoaMappings200Response
	fmt.Fprintf(os.Stdout, "Response from `ChartOfAccountsAPI.ListCoaMappings`: %v\n", resp)
}
```

### Path Parameters

This endpoint does not need any parameter.

### Other Parameters

Other parameters are passed through a pointer to a apiListCoaMappingsRequest struct via the builder pattern


### Return type

[**ListCoaMappings200Response**](ListCoaMappings200Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## UpdateChartOfAccount

> UpdateChartOfAccount(ctx, coaId).UpdateChartOfAccountRequest(updateChartOfAccountRequest).Execute()

Update a Chart of Account

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
	coaId := "coaId_example" // string | 
	updateChartOfAccountRequest := *openapiclient.NewUpdateChartOfAccountRequest("Code_example", "Name_example", "Type_example") // UpdateChartOfAccountRequest | 

	configuration := openapiclient.NewConfiguration()
	apiClient := openapiclient.NewAPIClient(configuration)
	r, err := apiClient.ChartOfAccountsAPI.UpdateChartOfAccount(context.Background(), coaId).UpdateChartOfAccountRequest(updateChartOfAccountRequest).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `ChartOfAccountsAPI.UpdateChartOfAccount``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
}
```

### Path Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**coaId** | **string** |  | 

### Other Parameters

Other parameters are passed through a pointer to a apiUpdateChartOfAccountRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **updateChartOfAccountRequest** | [**UpdateChartOfAccountRequest**](UpdateChartOfAccountRequest.md) |  | 

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

