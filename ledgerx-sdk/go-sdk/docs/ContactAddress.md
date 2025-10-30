# ContactAddress

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Address** | Pointer to **string** |  | [optional] 
**BlockchainId** | Pointer to **NullableString** |  | [optional] 

## Methods

### NewContactAddress

`func NewContactAddress() *ContactAddress`

NewContactAddress instantiates a new ContactAddress object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewContactAddressWithDefaults

`func NewContactAddressWithDefaults() *ContactAddress`

NewContactAddressWithDefaults instantiates a new ContactAddress object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAddress

`func (o *ContactAddress) GetAddress() string`

GetAddress returns the Address field if non-nil, zero value otherwise.

### GetAddressOk

`func (o *ContactAddress) GetAddressOk() (*string, bool)`

GetAddressOk returns a tuple with the Address field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAddress

`func (o *ContactAddress) SetAddress(v string)`

SetAddress sets Address field to given value.

### HasAddress

`func (o *ContactAddress) HasAddress() bool`

HasAddress returns a boolean if a field has been set.

### GetBlockchainId

`func (o *ContactAddress) GetBlockchainId() string`

GetBlockchainId returns the BlockchainId field if non-nil, zero value otherwise.

### GetBlockchainIdOk

`func (o *ContactAddress) GetBlockchainIdOk() (*string, bool)`

GetBlockchainIdOk returns a tuple with the BlockchainId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBlockchainId

`func (o *ContactAddress) SetBlockchainId(v string)`

SetBlockchainId sets BlockchainId field to given value.

### HasBlockchainId

`func (o *ContactAddress) HasBlockchainId() bool`

HasBlockchainId returns a boolean if a field has been set.

### SetBlockchainIdNil

`func (o *ContactAddress) SetBlockchainIdNil(b bool)`

 SetBlockchainIdNil sets the value for BlockchainId to be an explicit nil

### UnsetBlockchainId
`func (o *ContactAddress) UnsetBlockchainId()`

UnsetBlockchainId ensures that no value is present for BlockchainId, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


