# MembersListItem

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**AccountName** | Pointer to **string** |  | [optional] 
**AuthName** | Pointer to **string** |  | [optional] 
**FirstName** | Pointer to **string** |  | [optional] 
**LastName** | Pointer to **string** |  | [optional] 
**AccountImage** | Pointer to **NullableString** |  | [optional] 
**Role** | Pointer to **string** |  | [optional] 
**CreatedAt** | Pointer to **time.Time** |  | [optional] 
**Id** | Pointer to **string** |  | [optional] 
**OrganizationId** | Pointer to **string** |  | [optional] 

## Methods

### NewMembersListItem

`func NewMembersListItem() *MembersListItem`

NewMembersListItem instantiates a new MembersListItem object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewMembersListItemWithDefaults

`func NewMembersListItemWithDefaults() *MembersListItem`

NewMembersListItemWithDefaults instantiates a new MembersListItem object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAccountName

`func (o *MembersListItem) GetAccountName() string`

GetAccountName returns the AccountName field if non-nil, zero value otherwise.

### GetAccountNameOk

`func (o *MembersListItem) GetAccountNameOk() (*string, bool)`

GetAccountNameOk returns a tuple with the AccountName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAccountName

`func (o *MembersListItem) SetAccountName(v string)`

SetAccountName sets AccountName field to given value.

### HasAccountName

`func (o *MembersListItem) HasAccountName() bool`

HasAccountName returns a boolean if a field has been set.

### GetAuthName

`func (o *MembersListItem) GetAuthName() string`

GetAuthName returns the AuthName field if non-nil, zero value otherwise.

### GetAuthNameOk

`func (o *MembersListItem) GetAuthNameOk() (*string, bool)`

GetAuthNameOk returns a tuple with the AuthName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAuthName

`func (o *MembersListItem) SetAuthName(v string)`

SetAuthName sets AuthName field to given value.

### HasAuthName

`func (o *MembersListItem) HasAuthName() bool`

HasAuthName returns a boolean if a field has been set.

### GetFirstName

`func (o *MembersListItem) GetFirstName() string`

GetFirstName returns the FirstName field if non-nil, zero value otherwise.

### GetFirstNameOk

`func (o *MembersListItem) GetFirstNameOk() (*string, bool)`

GetFirstNameOk returns a tuple with the FirstName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFirstName

`func (o *MembersListItem) SetFirstName(v string)`

SetFirstName sets FirstName field to given value.

### HasFirstName

`func (o *MembersListItem) HasFirstName() bool`

HasFirstName returns a boolean if a field has been set.

### GetLastName

`func (o *MembersListItem) GetLastName() string`

GetLastName returns the LastName field if non-nil, zero value otherwise.

### GetLastNameOk

`func (o *MembersListItem) GetLastNameOk() (*string, bool)`

GetLastNameOk returns a tuple with the LastName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLastName

`func (o *MembersListItem) SetLastName(v string)`

SetLastName sets LastName field to given value.

### HasLastName

`func (o *MembersListItem) HasLastName() bool`

HasLastName returns a boolean if a field has been set.

### GetAccountImage

`func (o *MembersListItem) GetAccountImage() string`

GetAccountImage returns the AccountImage field if non-nil, zero value otherwise.

### GetAccountImageOk

`func (o *MembersListItem) GetAccountImageOk() (*string, bool)`

GetAccountImageOk returns a tuple with the AccountImage field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAccountImage

`func (o *MembersListItem) SetAccountImage(v string)`

SetAccountImage sets AccountImage field to given value.

### HasAccountImage

`func (o *MembersListItem) HasAccountImage() bool`

HasAccountImage returns a boolean if a field has been set.

### SetAccountImageNil

`func (o *MembersListItem) SetAccountImageNil(b bool)`

 SetAccountImageNil sets the value for AccountImage to be an explicit nil

### UnsetAccountImage
`func (o *MembersListItem) UnsetAccountImage()`

UnsetAccountImage ensures that no value is present for AccountImage, not even an explicit nil
### GetRole

`func (o *MembersListItem) GetRole() string`

GetRole returns the Role field if non-nil, zero value otherwise.

### GetRoleOk

`func (o *MembersListItem) GetRoleOk() (*string, bool)`

GetRoleOk returns a tuple with the Role field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRole

`func (o *MembersListItem) SetRole(v string)`

SetRole sets Role field to given value.

### HasRole

`func (o *MembersListItem) HasRole() bool`

HasRole returns a boolean if a field has been set.

### GetCreatedAt

`func (o *MembersListItem) GetCreatedAt() time.Time`

GetCreatedAt returns the CreatedAt field if non-nil, zero value otherwise.

### GetCreatedAtOk

`func (o *MembersListItem) GetCreatedAtOk() (*time.Time, bool)`

GetCreatedAtOk returns a tuple with the CreatedAt field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetCreatedAt

`func (o *MembersListItem) SetCreatedAt(v time.Time)`

SetCreatedAt sets CreatedAt field to given value.

### HasCreatedAt

`func (o *MembersListItem) HasCreatedAt() bool`

HasCreatedAt returns a boolean if a field has been set.

### GetId

`func (o *MembersListItem) GetId() string`

GetId returns the Id field if non-nil, zero value otherwise.

### GetIdOk

`func (o *MembersListItem) GetIdOk() (*string, bool)`

GetIdOk returns a tuple with the Id field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetId

`func (o *MembersListItem) SetId(v string)`

SetId sets Id field to given value.

### HasId

`func (o *MembersListItem) HasId() bool`

HasId returns a boolean if a field has been set.

### GetOrganizationId

`func (o *MembersListItem) GetOrganizationId() string`

GetOrganizationId returns the OrganizationId field if non-nil, zero value otherwise.

### GetOrganizationIdOk

`func (o *MembersListItem) GetOrganizationIdOk() (*string, bool)`

GetOrganizationIdOk returns a tuple with the OrganizationId field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetOrganizationId

`func (o *MembersListItem) SetOrganizationId(v string)`

SetOrganizationId sets OrganizationId field to given value.

### HasOrganizationId

`func (o *MembersListItem) HasOrganizationId() bool`

HasOrganizationId returns a boolean if a field has been set.


[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


