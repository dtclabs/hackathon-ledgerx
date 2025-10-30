## @ledgerx/sdk@1.0.0

This generator creates TypeScript/JavaScript client that utilizes [axios](https://github.com/axios/axios). The generated Node module can be used in the following environments:

Environment
* Node.js
* Webpack
* Browserify

Language level
* ES5 - you must have a Promises/A+ library installed
* ES6

Module system
* CommonJS
* ES6 module system

It can be used in both TypeScript and JavaScript. In TypeScript, the definition will be automatically resolved via `package.json`. ([Reference](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html))

### Building

To build and compile the typescript sources to javascript use:
```
npm install
npm run build
```

### Publishing

First build the package then run `npm publish`

### Consuming

navigate to the folder of your consuming project and run one of the following commands.

_published:_

```
npm install @ledgerx/sdk@1.0.0 --save
```

_unPublished (not recommended):_

```
npm install PATH_TO_GENERATED_PACKAGE --save
```

### Documentation for API Endpoints

All URIs are relative to *https://api.ledgerx.finance*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*ChartOfAccountsApi* | [**createChartOfAccount**](docs/ChartOfAccountsApi.md#createchartofaccount) | **POST** /chart-of-accounts | Create a Chart of Account
*ChartOfAccountsApi* | [**listChartOfAccounts**](docs/ChartOfAccountsApi.md#listchartofaccounts) | **GET** /chart-of-accounts | List Chart of Accounts
*ChartOfAccountsApi* | [**listCoaMappings**](docs/ChartOfAccountsApi.md#listcoamappings) | **GET** /chart-of-accounts-mappings | List Chart of Accounts mappings
*ChartOfAccountsApi* | [**updateChartOfAccount**](docs/ChartOfAccountsApi.md#updatechartofaccount) | **PUT** /chart-of-accounts/{coaId} | Update a Chart of Account
*FinancialTransactionsApi* | [**listFinancialTransactions**](docs/FinancialTransactionsApi.md#listfinancialtransactions) | **GET** /financial-transactions | List financial transactions (paginated)
*MembersApi* | [**deactivateMember**](docs/MembersApi.md#deactivatemember) | **PUT** /deactivate/{id} | Deactivate a member
*MembersApi* | [**inviteMember**](docs/MembersApi.md#invitemember) | **POST** /invitations | Invite a new member
*MembersApi* | [**listMembers**](docs/MembersApi.md#listmembers) | **GET** /members | List organization members (paginated)
*SyncApi* | [**createSyncJob**](docs/SyncApi.md#createsyncjob) | **POST** /sync | Request to sync a wallet
*SyncApi* | [**getSyncStatus**](docs/SyncApi.md#getsyncstatus) | **GET** /sync | Check sync job status
*SyncApi* | [**updateSyncJob**](docs/SyncApi.md#updatesyncjob) | **PUT** /sync/{jobId} | Pause or continue a sync job
*WalletGroupsApi* | [**createWalletGroup**](docs/WalletGroupsApi.md#createwalletgroup) | **POST** /wallet-groups | Create a new wallet group
*WalletGroupsApi* | [**listWalletGroups**](docs/WalletGroupsApi.md#listwalletgroups) | **GET** /wallet-groups | List wallet groups (paginated)
*WalletGroupsApi* | [**updateWalletGroup**](docs/WalletGroupsApi.md#updatewalletgroup) | **PUT** /wallet-groups/{id} | Update a wallet group
*WalletsApi* | [**importWallets**](docs/WalletsApi.md#importwallets) | **POST** /wallets | Import and sync wallets
*WalletsApi* | [**listWallets**](docs/WalletsApi.md#listwallets) | **GET** /wallets | Get list of wallets


### Documentation For Models

 - [ChartOfAccountMapping](docs/ChartOfAccountMapping.md)
 - [Contact](docs/Contact.md)
 - [ContactAddress](docs/ContactAddress.md)
 - [CreateChartOfAccount201Response](docs/CreateChartOfAccount201Response.md)
 - [CreateChartOfAccountRequest](docs/CreateChartOfAccountRequest.md)
 - [CreateWalletGroupRequest](docs/CreateWalletGroupRequest.md)
 - [Cryptocurrency](docs/Cryptocurrency.md)
 - [CryptocurrencyImage](docs/CryptocurrencyImage.md)
 - [FinancialTransaction](docs/FinancialTransaction.md)
 - [FinancialTransactionParent](docs/FinancialTransactionParent.md)
 - [FinancialTransactionTypeDetail](docs/FinancialTransactionTypeDetail.md)
 - [FinancialTransactionsResponse](docs/FinancialTransactionsResponse.md)
 - [FinancialTransactionsResponseData](docs/FinancialTransactionsResponseData.md)
 - [ImportWallets200Response](docs/ImportWallets200Response.md)
 - [ImportWalletsRequest](docs/ImportWalletsRequest.md)
 - [InviteMember201Response](docs/InviteMember201Response.md)
 - [InviteMemberRequest](docs/InviteMemberRequest.md)
 - [ListChartOfAccounts200Response](docs/ListChartOfAccounts200Response.md)
 - [ListChartOfAccounts200ResponseDataInner](docs/ListChartOfAccounts200ResponseDataInner.md)
 - [ListCoaMappings200Response](docs/ListCoaMappings200Response.md)
 - [ListMembers200Response](docs/ListMembers200Response.md)
 - [ListMembers200ResponseData](docs/ListMembers200ResponseData.md)
 - [ListWalletGroups200Response](docs/ListWalletGroups200Response.md)
 - [ListWalletGroups200ResponseDataInner](docs/ListWalletGroups200ResponseDataInner.md)
 - [MembersListItem](docs/MembersListItem.md)
 - [Pagination](docs/Pagination.md)
 - [SyncGetResponse](docs/SyncGetResponse.md)
 - [SyncPostRequest](docs/SyncPostRequest.md)
 - [SyncPostResponse](docs/SyncPostResponse.md)
 - [SyncPutRequest](docs/SyncPutRequest.md)
 - [SyncStatus](docs/SyncStatus.md)
 - [UpdateChartOfAccountRequest](docs/UpdateChartOfAccountRequest.md)
 - [UpdateWalletGroupRequest](docs/UpdateWalletGroupRequest.md)
 - [Wallet](docs/Wallet.md)
 - [WalletGroupRef](docs/WalletGroupRef.md)
 - [WalletListResponse](docs/WalletListResponse.md)
 - [WalletListResponseData](docs/WalletListResponseData.md)


<a id="documentation-for-authorization"></a>
## Documentation For Authorization


Authentication schemes defined for the API:
<a id="ApiKeyAuth"></a>
### ApiKeyAuth

- **Type**: API key
- **API key parameter name**: API_KEY
- **Location**: HTTP header

