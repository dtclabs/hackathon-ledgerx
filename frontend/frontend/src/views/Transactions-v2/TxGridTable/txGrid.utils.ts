export const getDefaultMappingOptions = (options, defaultMapping) => {
  if (defaultMapping) {
    return defaultMapping?.chartOfAccount
      ? [
          {
            value: null,
            label: 'Reset to default',
            id: defaultMapping?.chartOfAccount?.id ?? '',
            code: defaultMapping?.chartOfAccount?.code ?? '',
            name: defaultMapping?.chartOfAccount?.name ?? '',
            subLabel: defaultMapping?.chartOfAccount?.code
              ? `${defaultMapping?.chartOfAccount?.code} - ${defaultMapping?.chartOfAccount.name}`
              : defaultMapping?.chartOfAccount.name
          },
          ...options
        ]
      : options
  }

  return [
    {
      value: null,
      label: 'No Account'
    },
    ...options
  ]
}
