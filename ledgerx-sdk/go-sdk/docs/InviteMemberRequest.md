# InviteMemberRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Address** | Pointer to **NullableString** |  | [optional] 
**FirstName** | **string** |  | 
**LastName** | **string** |  | 
**Role** | **string** |  | 
**Email** | **string** |  | 
**Message** | Pointer to **NullableString** |  | [optional] 

## Methods

### NewInviteMemberRequest

`func NewInviteMemberRequest(firstName string, lastName string, role string, email string, ) *InviteMemberRequest`

NewInviteMemberRequest instantiates a new InviteMemberRequest object
This constructor will assign default values to properties that have it defined,
and makes sure properties required by API are set, but the set of arguments
will change when the set of required properties is changed

### NewInviteMemberRequestWithDefaults

`func NewInviteMemberRequestWithDefaults() *InviteMemberRequest`

NewInviteMemberRequestWithDefaults instantiates a new InviteMemberRequest object
This constructor will only assign default values to properties that have it defined,
but it doesn't guarantee that properties required by API are set

### GetAddress

`func (o *InviteMemberRequest) GetAddress() string`

GetAddress returns the Address field if non-nil, zero value otherwise.

### GetAddressOk

`func (o *InviteMemberRequest) GetAddressOk() (*string, bool)`

GetAddressOk returns a tuple with the Address field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetAddress

`func (o *InviteMemberRequest) SetAddress(v string)`

SetAddress sets Address field to given value.

### HasAddress

`func (o *InviteMemberRequest) HasAddress() bool`

HasAddress returns a boolean if a field has been set.

### SetAddressNil

`func (o *InviteMemberRequest) SetAddressNil(b bool)`

 SetAddressNil sets the value for Address to be an explicit nil

### UnsetAddress
`func (o *InviteMemberRequest) UnsetAddress()`

UnsetAddress ensures that no value is present for Address, not even an explicit nil
### GetFirstName

`func (o *InviteMemberRequest) GetFirstName() string`

GetFirstName returns the FirstName field if non-nil, zero value otherwise.

### GetFirstNameOk

`func (o *InviteMemberRequest) GetFirstNameOk() (*string, bool)`

GetFirstNameOk returns a tuple with the FirstName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetFirstName

`func (o *InviteMemberRequest) SetFirstName(v string)`

SetFirstName sets FirstName field to given value.


### GetLastName

`func (o *InviteMemberRequest) GetLastName() string`

GetLastName returns the LastName field if non-nil, zero value otherwise.

### GetLastNameOk

`func (o *InviteMemberRequest) GetLastNameOk() (*string, bool)`

GetLastNameOk returns a tuple with the LastName field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetLastName

`func (o *InviteMemberRequest) SetLastName(v string)`

SetLastName sets LastName field to given value.


### GetRole

`func (o *InviteMemberRequest) GetRole() string`

GetRole returns the Role field if non-nil, zero value otherwise.

### GetRoleOk

`func (o *InviteMemberRequest) GetRoleOk() (*string, bool)`

GetRoleOk returns a tuple with the Role field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetRole

`func (o *InviteMemberRequest) SetRole(v string)`

SetRole sets Role field to given value.


### GetEmail

`func (o *InviteMemberRequest) GetEmail() string`

GetEmail returns the Email field if non-nil, zero value otherwise.

### GetEmailOk

`func (o *InviteMemberRequest) GetEmailOk() (*string, bool)`

GetEmailOk returns a tuple with the Email field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetEmail

`func (o *InviteMemberRequest) SetEmail(v string)`

SetEmail sets Email field to given value.


### GetMessage

`func (o *InviteMemberRequest) GetMessage() string`

GetMessage returns the Message field if non-nil, zero value otherwise.

### GetMessageOk

`func (o *InviteMemberRequest) GetMessageOk() (*string, bool)`

GetMessageOk returns a tuple with the Message field if it's non-nil, zero value otherwise
and a boolean to check if the value has been set.

### SetMessage

`func (o *InviteMemberRequest) SetMessage(v string)`

SetMessage sets Message field to given value.

### HasMessage

`func (o *InviteMemberRequest) HasMessage() bool`

HasMessage returns a boolean if a field has been set.

### SetMessageNil

`func (o *InviteMemberRequest) SetMessageNil(b bool)`

 SetMessageNil sets the value for Message to be an explicit nil

### UnsetMessage
`func (o *InviteMemberRequest) UnsetMessage()`

UnsetMessage ensures that no value is present for Message, not even an explicit nil

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


