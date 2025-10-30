# FinancialTransaction

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | Pointer to **string** |  | [optional] 
**Hash** | Pointer to **string** |  | [optional] 
**BlockchainId** | Pointer to **string** |  | [optional] 
**FromAddress** | Pointer to **NullableString** |  | [optional] 
**ToAddress** | Pointer to **NullableString** |  | [optional] 
**ProxyAddress** | Pointer to **NullableString** |  | [optional] 
**Cryptocurrency** | Pointer to [**Cryptocurrency**](Cryptocurrency.md) |  | [optional] 
**CryptocurrencyAmount** | Pointer to **string** |  | [optional] 
**ValueTimestamp** | Pointer to **time.Time** |  | [optional] 
**Type** | Pointer to **string** |  | [optional] 
**TypeDetail** | Pointer to [**FinancialTransactionTypeDetail**](FinancialTransactionTypeDetail.md) |  | [optional] 
**Status** | Pointer to **string** |  | [optional] 
**Substatuses** | Pointer to **[]string** |  | [optional] 
**CostBasis** | Pointer to **NullableFloat32** |  | [optional] 
**FiatAmount** | Pointer to **NullableFloat32** | Fiat value (can be null if not available) | [optional] 
**FiatAmountPerUnit** | Pointer to **NullableFloat32** |  | [optional] 
**FiatCurrency** | Pointer to **NullableString** |  | [optional] 
**GainLoss** | Pointer to **NullableFloat32** |  | [optional] 
**Direction** | Pointer to **NullableString** |  | [optional] 
**Note** | Pointer to **NullableString** |  | [optional] 
**InvoiceId** | Pointer to **NullableString** |  | [optional] 
**Category** | Pointer to **NullableString** |  | [optional] 
**CorrespondingChartOfAccount** | Pointer to **NullableString** |  | [optional] 
**FinancialTransactionParent** | Pointer to [**FinancialTransactionParent**](FinancialTransactionParent.md) |  | [optional] 
**FromContact** | Pointer to [**Contact**](Contact.md) |  | [optional] 
**ToContact** | Pointer to [**Contact**](Contact.md) |  | [optional] 

## Methods

### NewFinancialTransaction

`func NewFinancialTransaction() *FinancialTransaction`

NewFinancialTransaction instantiates a new FinancialTransaction object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewFinancialTransactionWithDefaults

`func NewFinancialTransactionWithDefaults() *FinancialTransaction`

NewFinancialTransactionWithDefaults instantiates a new FinancialTransaction object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetId

`func (o *FinancialTransaction) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *FinancialTransaction) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *FinancialTransaction) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *FinancialTransaction) HasId() bool`

HasId returns a boolean if a field has been set.

### GetHash

`func (o *FinancialTransaction) GetHash() string`

GetHash returns the Hash field if non-nil, zero value otherwise.

### GetHashOk

`func (o *FinancialTransaction) GetHashOk() (*string, bool)`

GetHashOk returns a tuple with the Hash field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetHash

`func (o *FinancialTransaction) SetHash(v string)`

SetHash sets Hash field to given value.

### HasHash

`func (o *FinancialTransaction) HasHash() bool`

HasHash returns a boolean if a field has been set.

### GetBlockchainId

`func (o *FinancialTransaction) GetBlockchainId() string`

GetBlockchainId returns the BlockchainId field if non-nil, zero value otherwise.

### GetBlockchainIdOk

`func (o *FinancialTransaction) GetBlockchainIdOk() (*string, bool)`

GetBlockchainIdOk returns a tuple with the BlockchainId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetBlockchainId

`func (o *FinancialTransaction) SetBlockchainId(v string)`

SetBlockchainId sets BlockchainId field to given value.

### HasBlockchainId

`func (o *FinancialTransaction) HasBlockchainId() bool`

HasBlockchainId returns a boolean if a field has been set.

### GetFromAddress

`func (o *FinancialTransaction) GetFromAddress() string`

GetFromAddress returns the FromAddress field if non-nil, zero value otherwise.

### GetFromAddressOk

`func (o *FinancialTransaction) GetFromAddressOk() (*string, bool)`

GetFromAddressOk returns a tuple with the FromAddress field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFromAddress

`func (o *FinancialTransaction) SetFromAddress(v string)`

SetFromAddress sets FromAddress field to given value.

### HasFromAddress

`func (o *FinancialTransaction) HasFromAddress() bool`

HasFromAddress returns a boolean if a field has been set.

### SetFromAddressNil

`func (o *FinancialTransaction) SetFromAddressNil(b bool)`

 SetFromAddressNil sets the value for FromAddress to be an explicit nil

### UnsetFromAddress
`func (o *FinancialTransaction) UnsetFromAddress()`

UnsetFromAddress ensures that no value is present for FromAddress, not even an explicit nil
### GetToAddress

`func (o *FinancialTransaction) GetToAddress() string`

GetToAddress returns the ToAddress field if non-nil, zero value otherwise.

### GetToAddressOk

`func (o *FinancialTransaction) GetToAddressOk() (*string, bool)`

GetToAddressOk returns a tuple with the ToAddress field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetToAddress

`func (o *FinancialTransaction) SetToAddress(v string)`

SetToAddress sets ToAddress field to given value.

### HasToAddress

`func (o *FinancialTransaction) HasToAddress() bool`

HasToAddress returns a boolean if a field has been set.

### SetToAddressNil

`func (o *FinancialTransaction) SetToAddressNil(b bool)`

 SetToAddressNil sets the value for ToAddress to be an explicit nil

### UnsetToAddress
`func (o *FinancialTransaction) UnsetToAddress()`

UnsetToAddress ensures that no value is present for ToAddress, not even an explicit nil
### GetProxyAddress

`func (o *FinancialTransaction) GetProxyAddress() string`

GetProxyAddress returns the ProxyAddress field if non-nil, zero value otherwise.

### GetProxyAddressOk

`func (o *FinancialTransaction) GetProxyAddressOk() (*string, bool)`

GetProxyAddressOk returns a tuple with the ProxyAddress field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetProxyAddress

`func (o *FinancialTransaction) SetProxyAddress(v string)`

SetProxyAddress sets ProxyAddress field to given value.

### HasProxyAddress

`func (o *FinancialTransaction) HasProxyAddress() bool`

HasProxyAddress returns a boolean if a field has been set.

### SetProxyAddressNil

`func (o *FinancialTransaction) SetProxyAddressNil(b bool)`

 SetProxyAddressNil sets the value for ProxyAddress to be an explicit nil

### UnsetProxyAddress
`func (o *FinancialTransaction) UnsetProxyAddress()`

UnsetProxyAddress ensures that no value is present for ProxyAddress, not even an explicit nil
### GetCryptocurrency

`func (o *FinancialTransaction) GetCryptocurrency() Cryptocurrency`

GetCryptocurrency returns the Cryptocurrency field if non-nil, zero value otherwise.

### GetCryptocurrencyOk

`func (o *FinancialTransaction) GetCryptocurrencyOk() (*Cryptocurrency, bool)`

GetCryptocurrencyOk returns a tuple with the Cryptocurrency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCryptocurrency

`func (o *FinancialTransaction) SetCryptocurrency(v Cryptocurrency)`

SetCryptocurrency sets Cryptocurrency field to given value.

### HasCryptocurrency

`func (o *FinancialTransaction) HasCryptocurrency() bool`

HasCryptocurrency returns a boolean if a field has been set.

### GetCryptocurrencyAmount

`func (o *FinancialTransaction) GetCryptocurrencyAmount() string`

GetCryptocurrencyAmount returns the CryptocurrencyAmount field if non-nil, zero value otherwise.

### GetCryptocurrencyAmountOk

`func (o *FinancialTransaction) GetCryptocurrencyAmountOk() (*string, bool)`

GetCryptocurrencyAmountOk returns a tuple with the CryptocurrencyAmount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCryptocurrencyAmount

`func (o *FinancialTransaction) SetCryptocurrencyAmount(v string)`

SetCryptocurrencyAmount sets CryptocurrencyAmount field to given value.

### HasCryptocurrencyAmount

`func (o *FinancialTransaction) HasCryptocurrencyAmount() bool`

HasCryptocurrencyAmount returns a boolean if a field has been set.

### GetValueTimestamp

`func (o *FinancialTransaction) GetValueTimestamp() time.Time`

GetValueTimestamp returns the ValueTimestamp field if non-nil, zero value otherwise.

### GetValueTimestampOk

`func (o *FinancialTransaction) GetValueTimestampOk() (*time.Time, bool)`

GetValueTimestampOk returns a tuple with the ValueTimestamp field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetValueTimestamp

`func (o *FinancialTransaction) SetValueTimestamp(v time.Time)`

SetValueTimestamp sets ValueTimestamp field to given value.

### HasValueTimestamp

`func (o *FinancialTransaction) HasValueTimestamp() bool`

HasValueTimestamp returns a boolean if a field has been set.

### GetType

`func (o *FinancialTransaction) GetType() string`

GetType returns the Type field if non-nil, zero value otherwise.

### GetTypeOk

`func (o *FinancialTransaction) GetTypeOk() (*string, bool)`

GetTypeOk returns a tuple with the Type field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetType

`func (o *FinancialTransaction) SetType(v string)`

SetType sets Type field to given value.

### HasType

`func (o *FinancialTransaction) HasType() bool`

HasType returns a boolean if a field has been set.

### GetTypeDetail

`func (o *FinancialTransaction) GetTypeDetail() FinancialTransactionTypeDetail`

GetTypeDetail returns the TypeDetail field if non-nil, zero value otherwise.

### GetTypeDetailOk

`func (o *FinancialTransaction) GetTypeDetailOk() (*FinancialTransactionTypeDetail, bool)`

GetTypeDetailOk returns a tuple with the TypeDetail field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetTypeDetail

`func (o *FinancialTransaction) SetTypeDetail(v FinancialTransactionTypeDetail)`

SetTypeDetail sets TypeDetail field to given value.

### HasTypeDetail

`func (o *FinancialTransaction) HasTypeDetail() bool`

HasTypeDetail returns a boolean if a field has been set.

### GetStatus

`func (o *FinancialTransaction) GetStatus() string`

GetStatus returns the Status field if non-nil, zero value otherwise.

### GetStatusOk

`func (o *FinancialTransaction) GetStatusOk() (*string, bool)`

GetStatusOk returns a tuple with the Status field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetStatus

`func (o *FinancialTransaction) SetStatus(v string)`

SetStatus sets Status field to given value.

### HasStatus

`func (o *FinancialTransaction) HasStatus() bool`

HasStatus returns a boolean if a field has been set.

### GetSubstatuses

`func (o *FinancialTransaction) GetSubstatuses() []string`

GetSubstatuses returns the Substatuses field if non-nil, zero value otherwise.

### GetSubstatusesOk

`func (o *FinancialTransaction) GetSubstatusesOk() (*[]string, bool)`

GetSubstatusesOk returns a tuple with the Substatuses field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetSubstatuses

`func (o *FinancialTransaction) SetSubstatuses(v []string)`

SetSubstatuses sets Substatuses field to given value.

### HasSubstatuses

`func (o *FinancialTransaction) HasSubstatuses() bool`

HasSubstatuses returns a boolean if a field has been set.

### GetCostBasis

`func (o *FinancialTransaction) GetCostBasis() float32`

GetCostBasis returns the CostBasis field if non-nil, zero value otherwise.

### GetCostBasisOk

`func (o *FinancialTransaction) GetCostBasisOk() (*float32, bool)`

GetCostBasisOk returns a tuple with the CostBasis field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCostBasis

`func (o *FinancialTransaction) SetCostBasis(v float32)`

SetCostBasis sets CostBasis field to given value.

### HasCostBasis

`func (o *FinancialTransaction) HasCostBasis() bool`

HasCostBasis returns a boolean if a field has been set.

### SetCostBasisNil

`func (o *FinancialTransaction) SetCostBasisNil(b bool)`

 SetCostBasisNil sets the value for CostBasis to be an explicit nil

### UnsetCostBasis
`func (o *FinancialTransaction) UnsetCostBasis()`

UnsetCostBasis ensures that no value is present for CostBasis, not even an explicit nil
### GetFiatAmount

`func (o *FinancialTransaction) GetFiatAmount() float32`

GetFiatAmount returns the FiatAmount field if non-nil, zero value otherwise.

### GetFiatAmountOk

`func (o *FinancialTransaction) GetFiatAmountOk() (*float32, bool)`

GetFiatAmountOk returns a tuple with the FiatAmount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFiatAmount

`func (o *FinancialTransaction) SetFiatAmount(v float32)`

SetFiatAmount sets FiatAmount field to given value.

### HasFiatAmount

`func (o *FinancialTransaction) HasFiatAmount() bool`

HasFiatAmount returns a boolean if a field has been set.

### SetFiatAmountNil

`func (o *FinancialTransaction) SetFiatAmountNil(b bool)`

 SetFiatAmountNil sets the value for FiatAmount to be an explicit nil

### UnsetFiatAmount
`func (o *FinancialTransaction) UnsetFiatAmount()`

UnsetFiatAmount ensures that no value is present for FiatAmount, not even an explicit nil
### GetFiatAmountPerUnit

`func (o *FinancialTransaction) GetFiatAmountPerUnit() float32`

GetFiatAmountPerUnit returns the FiatAmountPerUnit field if non-nil, zero value otherwise.

### GetFiatAmountPerUnitOk

`func (o *FinancialTransaction) GetFiatAmountPerUnitOk() (*float32, bool)`

GetFiatAmountPerUnitOk returns a tuple with the FiatAmountPerUnit field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFiatAmountPerUnit

`func (o *FinancialTransaction) SetFiatAmountPerUnit(v float32)`

SetFiatAmountPerUnit sets FiatAmountPerUnit field to given value.

### HasFiatAmountPerUnit

`func (o *FinancialTransaction) HasFiatAmountPerUnit() bool`

HasFiatAmountPerUnit returns a boolean if a field has been set.

### SetFiatAmountPerUnitNil

`func (o *FinancialTransaction) SetFiatAmountPerUnitNil(b bool)`

 SetFiatAmountPerUnitNil sets the value for FiatAmountPerUnit to be an explicit nil

### UnsetFiatAmountPerUnit
`func (o *FinancialTransaction) UnsetFiatAmountPerUnit()`

UnsetFiatAmountPerUnit ensures that no value is present for FiatAmountPerUnit, not even an explicit nil
### GetFiatCurrency

`func (o *FinancialTransaction) GetFiatCurrency() string`

GetFiatCurrency returns the FiatCurrency field if non-nil, zero value otherwise.

### GetFiatCurrencyOk

`func (o *FinancialTransaction) GetFiatCurrencyOk() (*string, bool)`

GetFiatCurrencyOk returns a tuple with the FiatCurrency field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFiatCurrency

`func (o *FinancialTransaction) SetFiatCurrency(v string)`

SetFiatCurrency sets FiatCurrency field to given value.

### HasFiatCurrency

`func (o *FinancialTransaction) HasFiatCurrency() bool`

HasFiatCurrency returns a boolean if a field has been set.

### SetFiatCurrencyNil

`func (o *FinancialTransaction) SetFiatCurrencyNil(b bool)`

 SetFiatCurrencyNil sets the value for FiatCurrency to be an explicit nil

### UnsetFiatCurrency
`func (o *FinancialTransaction) UnsetFiatCurrency()`

UnsetFiatCurrency ensures that no value is present for FiatCurrency, not even an explicit nil
### GetGainLoss

`func (o *FinancialTransaction) GetGainLoss() float32`

GetGainLoss returns the GainLoss field if non-nil, zero value otherwise.

### GetGainLossOk

`func (o *FinancialTransaction) GetGainLossOk() (*float32, bool)`

GetGainLossOk returns a tuple with the GainLoss field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetGainLoss

`func (o *FinancialTransaction) SetGainLoss(v float32)`

SetGainLoss sets GainLoss field to given value.

### HasGainLoss

`func (o *FinancialTransaction) HasGainLoss() bool`

HasGainLoss returns a boolean if a field has been set.

### SetGainLossNil

`func (o *FinancialTransaction) SetGainLossNil(b bool)`

 SetGainLossNil sets the value for GainLoss to be an explicit nil

### UnsetGainLoss
`func (o *FinancialTransaction) UnsetGainLoss()`

UnsetGainLoss ensures that no value is present for GainLoss, not even an explicit nil
### GetDirection

`func (o *FinancialTransaction) GetDirection() string`

GetDirection returns the Direction field if non-nil, zero value otherwise.

### GetDirectionOk

`func (o *FinancialTransaction) GetDirectionOk() (*string, bool)`

GetDirectionOk returns a tuple with the Direction field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetDirection

`func (o *FinancialTransaction) SetDirection(v string)`

SetDirection sets Direction field to given value.

### HasDirection

`func (o *FinancialTransaction) HasDirection() bool`

HasDirection returns a boolean if a field has been set.

### SetDirectionNil

`func (o *FinancialTransaction) SetDirectionNil(b bool)`

 SetDirectionNil sets the value for Direction to be an explicit nil

### UnsetDirection
`func (o *FinancialTransaction) UnsetDirection()`

UnsetDirection ensures that no value is present for Direction, not even an explicit nil
### GetNote

`func (o *FinancialTransaction) GetNote() string`

GetNote returns the Note field if non-nil, zero value otherwise.

### GetNoteOk

`func (o *FinancialTransaction) GetNoteOk() (*string, bool)`

GetNoteOk returns a tuple with the Note field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetNote

`func (o *FinancialTransaction) SetNote(v string)`

SetNote sets Note field to given value.

### HasNote

`func (o *FinancialTransaction) HasNote() bool`

HasNote returns a boolean if a field has been set.

### SetNoteNil

`func (o *FinancialTransaction) SetNoteNil(b bool)`

 SetNoteNil sets the value for Note to be an explicit nil

### UnsetNote
`func (o *FinancialTransaction) UnsetNote()`

UnsetNote ensures that no value is present for Note, not even an explicit nil
### GetInvoiceId

`func (o *FinancialTransaction) GetInvoiceId() string`

GetInvoiceId returns the InvoiceId field if non-nil, zero value otherwise.

### GetInvoiceIdOk

`func (o *FinancialTransaction) GetInvoiceIdOk() (*string, bool)`

GetInvoiceIdOk returns a tuple with the InvoiceId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetInvoiceId

`func (o *FinancialTransaction) SetInvoiceId(v string)`

SetInvoiceId sets InvoiceId field to given value.

### HasInvoiceId

`func (o *FinancialTransaction) HasInvoiceId() bool`

HasInvoiceId returns a boolean if a field has been set.

### SetInvoiceIdNil

`func (o *FinancialTransaction) SetInvoiceIdNil(b bool)`

 SetInvoiceIdNil sets the value for InvoiceId to be an explicit nil

### UnsetInvoiceId
`func (o *FinancialTransaction) UnsetInvoiceId()`

UnsetInvoiceId ensures that no value is present for InvoiceId, not even an explicit nil
### GetCategory

`func (o *FinancialTransaction) GetCategory() string`

GetCategory returns the Category field if non-nil, zero value otherwise.

### GetCategoryOk

`func (o *FinancialTransaction) GetCategoryOk() (*string, bool)`

GetCategoryOk returns a tuple with the Category field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCategory

`func (o *FinancialTransaction) SetCategory(v string)`

SetCategory sets Category field to given value.

### HasCategory

`func (o *FinancialTransaction) HasCategory() bool`

HasCategory returns a boolean if a field has been set.

### SetCategoryNil

`func (o *FinancialTransaction) SetCategoryNil(b bool)`

 SetCategoryNil sets the value for Category to be an explicit nil

### UnsetCategory
`func (o *FinancialTransaction) UnsetCategory()`

UnsetCategory ensures that no value is present for Category, not even an explicit nil
### GetCorrespondingChartOfAccount

`func (o *FinancialTransaction) GetCorrespondingChartOfAccount() string`

GetCorrespondingChartOfAccount returns the CorrespondingChartOfAccount field if non-nil, zero value otherwise.

### GetCorrespondingChartOfAccountOk

`func (o *FinancialTransaction) GetCorrespondingChartOfAccountOk() (*string, bool)`

GetCorrespondingChartOfAccountOk returns a tuple with the CorrespondingChartOfAccount field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCorrespondingChartOfAccount

`func (o *FinancialTransaction) SetCorrespondingChartOfAccount(v string)`

SetCorrespondingChartOfAccount sets CorrespondingChartOfAccount field to given value.

### HasCorrespondingChartOfAccount

`func (o *FinancialTransaction) HasCorrespondingChartOfAccount() bool`

HasCorrespondingChartOfAccount returns a boolean if a field has been set.

### SetCorrespondingChartOfAccountNil

`func (o *FinancialTransaction) SetCorrespondingChartOfAccountNil(b bool)`

 SetCorrespondingChartOfAccountNil sets the value for CorrespondingChartOfAccount to be an explicit nil

### UnsetCorrespondingChartOfAccount
`func (o *FinancialTransaction) UnsetCorrespondingChartOfAccount()`

UnsetCorrespondingChartOfAccount ensures that no value is present for CorrespondingChartOfAccount, not even an explicit nil
### GetFinancialTransactionParent

`func (o *FinancialTransaction) GetFinancialTransactionParent() FinancialTransactionParent`

GetFinancialTransactionParent returns the FinancialTransactionParent field if non-nil, zero value otherwise.

### GetFinancialTransactionParentOk

`func (o *FinancialTransaction) GetFinancialTransactionParentOk() (*FinancialTransactionParent, bool)`

GetFinancialTransactionParentOk returns a tuple with the FinancialTransactionParent field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFinancialTransactionParent

`func (o *FinancialTransaction) SetFinancialTransactionParent(v FinancialTransactionParent)`

SetFinancialTransactionParent sets FinancialTransactionParent field to given value.

### HasFinancialTransactionParent

`func (o *FinancialTransaction) HasFinancialTransactionParent() bool`

HasFinancialTransactionParent returns a boolean if a field has been set.

### GetFromContact

`func (o *FinancialTransaction) GetFromContact() Contact`

GetFromContact returns the FromContact field if non-nil, zero value otherwise.

### GetFromContactOk

`func (o *FinancialTransaction) GetFromContactOk() (*Contact, bool)`

GetFromContactOk returns a tuple with the FromContact field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFromContact

`func (o *FinancialTransaction) SetFromContact(v Contact)`

SetFromContact sets FromContact field to given value.

### HasFromContact

`func (o *FinancialTransaction) HasFromContact() bool`

HasFromContact returns a boolean if a field has been set.

### GetToContact

`func (o *FinancialTransaction) GetToContact() Contact`

GetToContact returns the ToContact field if non-nil, zero value otherwise.

### GetToContactOk

`func (o *FinancialTransaction) GetToContactOk() (*Contact, bool)`

GetToContactOk returns a tuple with the ToContact field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetToContact

`func (o *FinancialTransaction) SetToContact(v Contact)`

SetToContact sets ToContact field to given value.

### HasToContact

`func (o *FinancialTransaction) HasToContact() bool`

HasToContact returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


