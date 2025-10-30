# ListMembers200ResponseData

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**TotalItems** | Pointer to **int32** |  | [optional] 
**TotalPages** | Pointer to **int32** |  | [optional] 
**CurrentPage** | Pointer to **int32** |  | [optional] 
**Items** | Pointer to [**[]MembersListItem**](MembersListItem.md) |  | [optional] 
**Limit** | Pointer to **int32** |  | [optional] 

## Methods

### NewListMembers200ResponseData

`func NewListMembers200ResponseData() *ListMembers200ResponseData`

NewListMembers200ResponseData instantiates a new ListMembers200ResponseData object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewListMembers200ResponseDataWithDefaults

`func NewListMembers200ResponseDataWithDefaults() *ListMembers200ResponseData`

NewListMembers200ResponseDataWithDefaults instantiates a new ListMembers200ResponseData object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetTotalItems

`func (o *ListMembers200ResponseData) GetTotalItems() int32`

GetTotalItems returns the TotalItems field if non-nil, zero value otherwise.

### GetTotalItemsOk

`func (o *ListMembers200ResponseData) GetTotalItemsOk() (*int32, bool)`

GetTotalItemsOk returns a tuple with the TotalItems field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotalItems

`func (o *ListMembers200ResponseData) SetTotalItems(v int32)`

SetTotalItems sets TotalItems field to given value.

### HasTotalItems

`func (o *ListMembers200ResponseData) HasTotalItems() bool`

HasTotalItems returns a boolean if a field has been set.

### GetTotalPages

`func (o *ListMembers200ResponseData) GetTotalPages() int32`

GetTotalPages returns the TotalPages field if non-nil, zero value otherwise.

### GetTotalPagesOk

`func (o *ListMembers200ResponseData) GetTotalPagesOk() (*int32, bool)`

GetTotalPagesOk returns a tuple with the TotalPages field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTotalPages

`func (o *ListMembers200ResponseData) SetTotalPages(v int32)`

SetTotalPages sets TotalPages field to given value.

### HasTotalPages

`func (o *ListMembers200ResponseData) HasTotalPages() bool`

HasTotalPages returns a boolean if a field has been set.

### GetCurrentPage

`func (o *ListMembers200ResponseData) GetCurrentPage() int32`

GetCurrentPage returns the CurrentPage field if non-nil, zero value otherwise.

### GetCurrentPageOk

`func (o *ListMembers200ResponseData) GetCurrentPageOk() (*int32, bool)`

GetCurrentPageOk returns a tuple with the CurrentPage field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCurrentPage

`func (o *ListMembers200ResponseData) SetCurrentPage(v int32)`

SetCurrentPage sets CurrentPage field to given value.

### HasCurrentPage

`func (o *ListMembers200ResponseData) HasCurrentPage() bool`

HasCurrentPage returns a boolean if a field has been set.

### GetItems

`func (o *ListMembers200ResponseData) GetItems() []MembersListItem`

GetItems returns the Items field if non-nil, zero value otherwise.

### GetItemsOk

`func (o *ListMembers200ResponseData) GetItemsOk() (*[]MembersListItem, bool)`

GetItemsOk returns a tuple with the Items field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetItems

`func (o *ListMembers200ResponseData) SetItems(v []MembersListItem)`

SetItems sets Items field to given value.

### HasItems

`func (o *ListMembers200ResponseData) HasItems() bool`

HasItems returns a boolean if a field has been set.

### GetLimit

`func (o *ListMembers200ResponseData) GetLimit() int32`

GetLimit returns the Limit field if non-nil, zero value otherwise.

### GetLimitOk

`func (o *ListMembers200ResponseData) GetLimitOk() (*int32, bool)`

GetLimitOk returns a tuple with the Limit field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLimit

`func (o *ListMembers200ResponseData) SetLimit(v int32)`

SetLimit sets Limit field to given value.

### HasLimit

`func (o *ListMembers200ResponseData) HasLimit() bool`

HasLimit returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


