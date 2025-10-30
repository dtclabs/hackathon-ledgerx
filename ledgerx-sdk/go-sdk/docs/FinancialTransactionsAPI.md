# \FinancialTransactionsAPI

All URIs are relative to *https://api.ledgerx.finance*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ListFinancialTransactions**](FinancialTransactionsAPI.md#ListFinancialTransactions) | **Get** /financial-transactions | List financial transactions (paginated)



## ListFinancialTransactions

> FinancialTransactionsResponse ListFinancialTransactions(ctx).Page(page).Limit(limit).Execute()

List financial transactions (paginated)

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
	resp, r, err := apiClient.FinancialTransactionsAPI.ListFinancialTransactions(context.Background()).Page(page).Limit(limit).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `FinancialTransactionsAPI.ListFinancialTransactions``: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListFinancialTransactions`: FinancialTransactionsResponse
	fmt.Fprintf(os.Stdout, "Response from `FinancialTransactionsAPI.ListFinancialTransactions`: %v\n", resp)
}
```

### Path Parameters



### Other Parameters

Other parameters are passed through a pointer to a apiListFinancialTransactionsRequest struct via the builder pattern


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **page** | **int32** |  | [default to 0]
 **limit** | **int32** |  | [default to 20]

### Return type

[**FinancialTransactionsResponse**](FinancialTransactionsResponse.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

