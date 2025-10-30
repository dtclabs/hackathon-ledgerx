# FinancialTransactionsResponseData

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Items** | Pointer to [**[]FinancialTransaction**](FinancialTransaction.md) |  | [optional] 
**Pagination** | Pointer to [**Pagination**](Pagination.md) |  | [optional] 

## Methods

### NewFinancialTransactionsResponseData

`func NewFinancialTransactionsResponseData() *FinancialTransactionsResponseData`

NewFinancialTransactionsResponseData instantiates a new FinancialTransactionsResponseData object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewFinancialTransactionsResponseDataWithDefaults

`func NewFinancialTransactionsResponseDataWithDefaults() *FinancialTransactionsResponseData`

NewFinancialTransactionsResponseDataWithDefaults instantiates a new FinancialTransactionsResponseData object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetItems

`func (o *FinancialTransactionsResponseData) GetItems() []FinancialTransaction`

GetItems returns the Items field if non-nil, zero value otherwise.

### GetItemsOk

`func (o *FinancialTransactionsResponseData) GetItemsOk() (*[]FinancialTransaction, bool)`

GetItemsOk returns a tuple with the Items field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetItems

`func (o *FinancialTransactionsResponseData) SetItems(v []FinancialTransaction)`

SetItems sets Items field to given value.

### HasItems

`func (o *FinancialTransactionsResponseData) HasItems() bool`

HasItems returns a boolean if a field has been set.

### GetPagination

`func (o *FinancialTransactionsResponseData) GetPagination() Pagination`

GetPagination returns the Pagination field if non-nil, zero value otherwise.

### GetPaginationOk

`func (o *FinancialTransactionsResponseData) GetPaginationOk() (*Pagination, bool)`

GetPaginationOk returns a tuple with the Pagination field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPagination

`func (o *FinancialTransactionsResponseData) SetPagination(v Pagination)`

SetPagination sets Pagination field to given value.

### HasPagination

`func (o *FinancialTransactionsResponseData) HasPagination() bool`

HasPagination returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


