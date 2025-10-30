# CreateWalletGroupRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | **string** |  | 
**SupportedBlockchains** | **[]string** |  | 

## Methods

### NewCreateWalletGroupRequest

`func NewCreateWalletGroupRequest(name string, supportedBlockchains []string, ) *CreateWalletGroupRequest`

NewCreateWalletGroupRequest instantiates a new CreateWalletGroupRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCreateWalletGroupRequestWithDefaults

`func NewCreateWalletGroupRequestWithDefaults() *CreateWalletGroupRequest`

NewCreateWalletGroupRequestWithDefaults instantiates a new CreateWalletGroupRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetName

`func (o *CreateWalletGroupRequest) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *CreateWalletGroupRequest) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *CreateWalletGroupRequest) SetName(v string)`

SetName sets Name field to given value.


### GetSupportedBlockchains

`func (o *CreateWalletGroupRequest) GetSupportedBlockchains() []string`

GetSupportedBlockchains returns the SupportedBlockchains field if non-nil, zero value otherwise.

### GetSupportedBlockchainsOk

`func (o *CreateWalletGroupRequest) GetSupportedBlockchainsOk() (*[]string, bool)`

GetSupportedBlockchainsOk returns a tuple with the SupportedBlockchains field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSupportedBlockchains

`func (o *CreateWalletGroupRequest) SetSupportedBlockchains(v []string)`

SetSupportedBlockchains sets SupportedBlockchains field to given value.



[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


