# Cell Values

- field: Will map the field based on the object
- valueGetter: Provides a cb function to access the data and parse it

All valueGetters must be pure functions. This is important as the grid will only call your valueGetter once during a redraw.