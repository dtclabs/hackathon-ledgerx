// Any new type added below should be added to getChartOfAccountFlagAndMappingOfFinancialTransaction as well
export enum ChartOfAccountMappingType {
  FEE = 'fee',
  GAIN = 'gain',
  LOSS = 'loss',
  ROUNDING = 'rounding',
  WALLET = 'wallet',
  RECIPIENT = 'recipient'
}

export const ChartOfAccountMappingTypeGroups = {
  CHANGE_CORRESPONDING_COA: [ChartOfAccountMappingType.FEE, ChartOfAccountMappingType.RECIPIENT]
}
