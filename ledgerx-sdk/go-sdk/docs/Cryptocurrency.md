# Cryptocurrency

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Name** | Pointer to **string** |  | [optional] 
**PublicId** | Pointer to **string** |  | [optional] 
**Symbol** | Pointer to **string** |  | [optional] 
**Image** | Pointer to [**CryptocurrencyImage**](CryptocurrencyImage.md) |  | [optional] 
**IsVerified** | Pointer to **bool** |  | [optional] 
**Addresses** | Pointer to **[]string** |  | [optional] 

## Methods

### NewCryptocurrency

`func NewCryptocurrency() *Cryptocurrency`

NewCryptocurrency instantiates a new Cryptocurrency object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewCryptocurrencyWithDefaults

`func NewCryptocurrencyWithDefaults() *Cryptocurrency`

NewCryptocurrencyWithDefaults instantiates a new Cryptocurrency object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetName

`func (o *Cryptocurrency) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *Cryptocurrency) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *Cryptocurrency) SetName(v string)`

SetName sets Name field to given value.

### HasName

`func (o *Cryptocurrency) HasName() bool`

HasName returns a boolean if a field has been set.

### GetPublicId

`func (o *Cryptocurrency) GetPublicId() string`

GetPublicId returns the PublicId field if non-nil, zero value otherwise.

### GetPublicIdOk

`func (o *Cryptocurrency) GetPublicIdOk() (*string, bool)`

GetPublicIdOk returns a tuple with the PublicId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetPublicId

`func (o *Cryptocurrency) SetPublicId(v string)`

SetPublicId sets PublicId field to given value.

### HasPublicId

`func (o *Cryptocurrency) HasPublicId() bool`

HasPublicId returns a boolean if a field has been set.

### GetSymbol

`func (o *Cryptocurrency) GetSymbol() string`

GetSymbol returns the Symbol field if non-nil, zero value otherwise.

### GetSymbolOk

`func (o *Cryptocurrency) GetSymbolOk() (*string, bool)`

GetSymbolOk returns a tuple with the Symbol field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSymbol

`func (o *Cryptocurrency) SetSymbol(v string)`

SetSymbol sets Symbol field to given value.

### HasSymbol

`func (o *Cryptocurrency) HasSymbol() bool`

HasSymbol returns a boolean if a field has been set.

### GetImage

`func (o *Cryptocurrency) GetImage() CryptocurrencyImage`

GetImage returns the Image field if non-nil, zero value otherwise.

### GetImageOk

`func (o *Cryptocurrency) GetImageOk() (*CryptocurrencyImage, bool)`

GetImageOk returns a tuple with the Image field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetImage

`func (o *Cryptocurrency) SetImage(v CryptocurrencyImage)`

SetImage sets Image field to given value.

### HasImage

`func (o *Cryptocurrency) HasImage() bool`

HasImage returns a boolean if a field has been set.

### GetIsVerified

`func (o *Cryptocurrency) GetIsVerified() bool`

GetIsVerified returns the IsVerified field if non-nil, zero value otherwise.

### GetIsVerifiedOk

`func (o *Cryptocurrency) GetIsVerifiedOk() (*bool, bool)`

GetIsVerifiedOk returns a tuple with the IsVerified field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetIsVerified

`func (o *Cryptocurrency) SetIsVerified(v bool)`

SetIsVerified sets IsVerified field to given value.

### HasIsVerified

`func (o *Cryptocurrency) HasIsVerified() bool`

HasIsVerified returns a boolean if a field has been set.

### GetAddresses

`func (o *Cryptocurrency) GetAddresses() []string`

GetAddresses returns the Addresses field if non-nil, zero value otherwise.

### GetAddressesOk

`func (o *Cryptocurrency) GetAddressesOk() (*[]string, bool)`

GetAddressesOk returns a tuple with the Addresses field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAddresses

`func (o *Cryptocurrency) SetAddresses(v []string)`

SetAddresses sets Addresses field to given value.

### HasAddresses

`func (o *Cryptocurrency) HasAddresses() bool`

HasAddresses returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


