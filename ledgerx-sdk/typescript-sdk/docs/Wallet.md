# Wallet


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  | [optional] [default to undefined]
**name** | **string** |  | [optional] [default to undefined]
**address** | **string** |  | [optional] [default to undefined]
**sourceType** | **string** |  | [optional] [default to undefined]
**flaggedAt** | **string** |  | [optional] [default to undefined]
**group** | [**WalletGroupRef**](WalletGroupRef.md) |  | [optional] [default to undefined]
**balance** | **number** |  | [optional] [default to undefined]
**status** | **string** |  | [optional] [default to undefined]
**metadata** | **object** |  | [optional] [default to undefined]
**lastSyncedAt** | **string** |  | [optional] [default to undefined]
**createdAt** | **string** |  | [optional] [default to undefined]
**supportedBlockchains** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**ownedCryptocurrencies** | **object** |  | [optional] [default to undefined]

## Example

```typescript
import { Wallet } from '@ledgerx/sdk';

const instance: Wallet = {
    id,
    name,
    address,
    sourceType,
    flaggedAt,
    group,
    balance,
    status,
    metadata,
    lastSyncedAt,
    createdAt,
    supportedBlockchains,
    ownedCryptocurrencies,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
