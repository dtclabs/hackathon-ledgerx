# Wallet

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | Pointer to **string** |  | [optional] 
**Name** | Pointer to **string** |  | [optional] 
**Address** | Pointer to **string** |  | [optional] 
**SourceType** | Pointer to **string** |  | [optional] 
**FlaggedAt** | Pointer to **NullableTime** |  | [optional] 
**Group** | Pointer to [**WalletGroupRef**](WalletGroupRef.md) |  | [optional] 
**Balance** | Pointer to **NullableFloat32** |  | [optional] 
**Status** | Pointer to **string** |  | [optional] 
**Metadata** | Pointer to **map[string]interface{}** |  | [optional] 
**LastSyncedAt** | Pointer to **NullableTime** |  | [optional] 
**CreatedAt** | Pointer to **time.Time** |  | [optional] 
**SupportedBlockchains** | Pointer to **[]string** |  | [optional] 
**OwnedCryptocurrencies** | Pointer to **map[string]interface{}** |  | [optional] 

## Methods

### NewWallet

`func NewWallet() *Wallet`

NewWallet instantiates a new Wallet object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewWalletWithDefaults

`func NewWalletWithDefaults() *Wallet`

NewWalletWithDefaults instantiates a new Wallet object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *Wallet) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *Wallet) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *Wallet) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *Wallet) HasId() bool`

HasId returns a boolean if a field has been set.

### GetName

`func (o *Wallet) GetName() string`

GetName returns the Name field if non-nil, zero value otherwise.

### GetNameOk

`func (o *Wallet) GetNameOk() (*string, bool)`

GetNameOk returns a tuple with the Name field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetName

`func (o *Wallet) SetName(v string)`

SetName sets Name field to given value.

### HasName

`func (o *Wallet) HasName() bool`

HasName returns a boolean if a field has been set.

### GetAddress

`func (o *Wallet) GetAddress() string`

GetAddress returns the Address field if non-nil, zero value otherwise.

### GetAddressOk

`func (o *Wallet) GetAddressOk() (*string, bool)`

GetAddressOk returns a tuple with the Address field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAddress

`func (o *Wallet) SetAddress(v string)`

SetAddress sets Address field to given value.

### HasAddress

`func (o *Wallet) HasAddress() bool`

HasAddress returns a boolean if a field has been set.

### GetSourceType

`func (o *Wallet) GetSourceType() string`

GetSourceType returns the SourceType field if non-nil, zero value otherwise.

### GetSourceTypeOk

`func (o *Wallet) GetSourceTypeOk() (*string, bool)`

GetSourceTypeOk returns a tuple with the SourceType field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSourceType

`func (o *Wallet) SetSourceType(v string)`

SetSourceType sets SourceType field to given value.

### HasSourceType

`func (o *Wallet) HasSourceType() bool`

HasSourceType returns a boolean if a field has been set.

### GetFlaggedAt

`func (o *Wallet) GetFlaggedAt() time.Time`

GetFlaggedAt returns the FlaggedAt field if non-nil, zero value otherwise.

### GetFlaggedAtOk

`func (o *Wallet) GetFlaggedAtOk() (*time.Time, bool)`

GetFlaggedAtOk returns a tuple with the FlaggedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFlaggedAt

`func (o *Wallet) SetFlaggedAt(v time.Time)`

SetFlaggedAt sets FlaggedAt field to given value.

### HasFlaggedAt

`func (o *Wallet) HasFlaggedAt() bool`

HasFlaggedAt returns a boolean if a field has been set.

### SetFlaggedAtNil

`func (o *Wallet) SetFlaggedAtNil(b bool)`

 SetFlaggedAtNil sets the value for FlaggedAt to be an explicit nil

### UnsetFlaggedAt
`func (o *Wallet) UnsetFlaggedAt()`

UnsetFlaggedAt ensures that no value is present for FlaggedAt, not even an explicit nil
### GetGroup

`func (o *Wallet) GetGroup() WalletGroupRef`

GetGroup returns the Group field if non-nil, zero value otherwise.

### GetGroupOk

`func (o *Wallet) GetGroupOk() (*WalletGroupRef, bool)`

GetGroupOk returns a tuple with the Group field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetGroup

`func (o *Wallet) SetGroup(v WalletGroupRef)`

SetGroup sets Group field to given value.

### HasGroup

`func (o *Wallet) HasGroup() bool`

HasGroup returns a boolean if a field has been set.

### GetBalance

`func (o *Wallet) GetBalance() float32`

GetBalance returns the Balance field if non-nil, zero value otherwise.

### GetBalanceOk

`func (o *Wallet) GetBalanceOk() (*float32, bool)`

GetBalanceOk returns a tuple with the Balance field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBalance

`func (o *Wallet) SetBalance(v float32)`

SetBalance sets Balance field to given value.

### HasBalance

`func (o *Wallet) HasBalance() bool`

HasBalance returns a boolean if a field has been set.

### SetBalanceNil

`func (o *Wallet) SetBalanceNil(b bool)`

 SetBalanceNil sets the value for Balance to be an explicit nil

### UnsetBalance
`func (o *Wallet) UnsetBalance()`

UnsetBalance ensures that no value is present for Balance, not even an explicit nil
### GetStatus

`func (o *Wallet) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *Wallet) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *Wallet) SetStatus(v string)`

SetStatus sets Status field to given value.

### HasStatus

`func (o *Wallet) HasStatus() bool`

HasStatus returns a boolean if a field has been set.

### GetMetadata

`func (o *Wallet) GetMetadata() map[string]interface{}`

GetMetadata returns the Metadata field if non-nil, zero value otherwise.

### GetMetadataOk

`func (o *Wallet) GetMetadataOk() (*map[string]interface{}, bool)`

GetMetadataOk returns a tuple with the Metadata field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMetadata

`func (o *Wallet) SetMetadata(v map[string]interface{})`

SetMetadata sets Metadata field to given value.

### HasMetadata

`func (o *Wallet) HasMetadata() bool`

HasMetadata returns a boolean if a field has been set.

### SetMetadataNil

`func (o *Wallet) SetMetadataNil(b bool)`

 SetMetadataNil sets the value for Metadata to be an explicit nil

### UnsetMetadata
`func (o *Wallet) UnsetMetadata()`

UnsetMetadata ensures that no value is present for Metadata, not even an explicit nil
### GetLastSyncedAt

`func (o *Wallet) GetLastSyncedAt() time.Time`

GetLastSyncedAt returns the LastSyncedAt field if non-nil, zero value otherwise.

### GetLastSyncedAtOk

`func (o *Wallet) GetLastSyncedAtOk() (*time.Time, bool)`

GetLastSyncedAtOk returns a tuple with the LastSyncedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLastSyncedAt

`func (o *Wallet) SetLastSyncedAt(v time.Time)`

SetLastSyncedAt sets LastSyncedAt field to given value.

### HasLastSyncedAt

`func (o *Wallet) HasLastSyncedAt() bool`

HasLastSyncedAt returns a boolean if a field has been set.

### SetLastSyncedAtNil

`func (o *Wallet) SetLastSyncedAtNil(b bool)`

 SetLastSyncedAtNil sets the value for LastSyncedAt to be an explicit nil

### UnsetLastSyncedAt
`func (o *Wallet) UnsetLastSyncedAt()`

UnsetLastSyncedAt ensures that no value is present for LastSyncedAt, not even an explicit nil
### GetCreatedAt

`func (o *Wallet) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *Wallet) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *Wallet) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.

### HasCreatedAt

`func (o *Wallet) HasCreatedAt() bool`

HasCreatedAt returns a boolean if a field has been set.

### GetSupportedBlockchains

`func (o *Wallet) GetSupportedBlockchains() []string`

GetSupportedBlockchains returns the SupportedBlockchains field if non-nil, zero value otherwise.

### GetSupportedBlockchainsOk

`func (o *Wallet) GetSupportedBlockchainsOk() (*[]string, bool)`

GetSupportedBlockchainsOk returns a tuple with the SupportedBlockchains field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSupportedBlockchains

`func (o *Wallet) SetSupportedBlockchains(v []string)`

SetSupportedBlockchains sets SupportedBlockchains field to given value.

### HasSupportedBlockchains

`func (o *Wallet) HasSupportedBlockchains() bool`

HasSupportedBlockchains returns a boolean if a field has been set.

### GetOwnedCryptocurrencies

`func (o *Wallet) GetOwnedCryptocurrencies() map[string]interface{}`

GetOwnedCryptocurrencies returns the OwnedCryptocurrencies field if non-nil, zero value otherwise.

### GetOwnedCryptocurrenciesOk

`func (o *Wallet) GetOwnedCryptocurrenciesOk() (*map[string]interface{}, bool)`

GetOwnedCryptocurrenciesOk returns a tuple with the OwnedCryptocurrencies field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetOwnedCryptocurrencies

`func (o *Wallet) SetOwnedCryptocurrencies(v map[string]interface{})`

SetOwnedCryptocurrencies sets OwnedCryptocurrencies field to given value.

### HasOwnedCryptocurrencies

`func (o *Wallet) HasOwnedCryptocurrencies() bool`

HasOwnedCryptocurrencies returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


