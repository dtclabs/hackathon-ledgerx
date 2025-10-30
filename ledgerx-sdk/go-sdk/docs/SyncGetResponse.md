# SyncGetResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Status** | Pointer to [**SyncStatus**](SyncStatus.md) |  | [optional] 
**WalletId** | Pointer to **string** |  | [optional] 

## Methods

### NewSyncGetResponse

`func NewSyncGetResponse() *SyncGetResponse`

NewSyncGetResponse instantiates a new SyncGetResponse object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewSyncGetResponseWithDefaults

`func NewSyncGetResponseWithDefaults() *SyncGetResponse`

NewSyncGetResponseWithDefaults instantiates a new SyncGetResponse object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetStatus

`func (o *SyncGetResponse) GetStatus() SyncStatus`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *SyncGetResponse) GetStatusOk() (*SyncStatus, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *SyncGetResponse) SetStatus(v SyncStatus)`

SetStatus sets Status field to given value.

### HasStatus

`func (o *SyncGetResponse) HasStatus() bool`

HasStatus returns a boolean if a field has been set.

### GetWalletId

`func (o *SyncGetResponse) GetWalletId() string`

GetWalletId returns the WalletId field if non-nil, zero value otherwise.

### GetWalletIdOk

`func (o *SyncGetResponse) GetWalletIdOk() (*string, bool)`

GetWalletIdOk returns a tuple with the WalletId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetWalletId

`func (o *SyncGetResponse) SetWalletId(v string)`

SetWalletId sets WalletId field to given value.

### HasWalletId

`func (o *SyncGetResponse) HasWalletId() bool`

HasWalletId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


