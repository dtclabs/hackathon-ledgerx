# WalletListResponseData

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Items** | Pointer to [**[]Wallet**](Wallet.md) |  | [optional] 
**Pagination** | Pointer to [**Pagination**](Pagination.md) |  | [optional] 

## Methods

### NewWalletListResponseData

`func NewWalletListResponseData() *WalletListResponseData`

NewWalletListResponseData instantiates a new WalletListResponseData object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewWalletListResponseDataWithDefaults

`func NewWalletListResponseDataWithDefaults() *WalletListResponseData`

NewWalletListResponseDataWithDefaults instantiates a new WalletListResponseData object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetItems

`func (o *WalletListResponseData) GetItems() []Wallet`

GetItems returns the Items field if non-nil, zero value otherwise.

### GetItemsOk

`func (o *WalletListResponseData) GetItemsOk() (*[]Wallet, bool)`

GetItemsOk returns a tuple with the Items field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetItems

`func (o *WalletListResponseData) SetItems(v []Wallet)`

SetItems sets Items field to given value.

### HasItems

`func (o *WalletListResponseData) HasItems() bool`

HasItems returns a boolean if a field has been set.

### GetPagination

`func (o *WalletListResponseData) GetPagination() Pagination`

GetPagination returns the Pagination field if non-nil, zero value otherwise.

### GetPaginationOk

`func (o *WalletListResponseData) GetPaginationOk() (*Pagination, bool)`

GetPaginationOk returns a tuple with the Pagination field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPagination

`func (o *WalletListResponseData) SetPagination(v Pagination)`

SetPagination sets Pagination field to given value.

### HasPagination

`func (o *WalletListResponseData) HasPagination() bool`

HasPagination returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


