// export type Result<T, E extends { type: string }> = { isSuccess: true; data: T } | { isSuccess: false; error: E }
export type Result<T, E extends { type: string }> = { isSuccess: true; data: T } | { isSuccess: false; error: E }
// type ExecutePaymentErrors = { type: 'NoWalletFound'; data: any } | { type: 'UnknownError'; data: any }

// Define a type transformation function to generate error types
// interface ErrorWithType {
//   type: string
// }

// export type CustomErrorType<T extends Error & ErrorWithType> = { type: T['type']; data: Omit<T, 'type'> }
