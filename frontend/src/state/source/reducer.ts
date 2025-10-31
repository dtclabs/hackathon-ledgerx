import { createReducer } from '@reduxjs/toolkit'
import { resetSource } from './actions'

export default createReducer({}, (builder) => {
  builder.addCase(resetSource, (state) => null)
})
