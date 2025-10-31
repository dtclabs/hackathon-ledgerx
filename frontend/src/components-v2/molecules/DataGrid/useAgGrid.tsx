/* eslint-disable prefer-template */
import { useEffect, useRef } from 'react'
import { AgGridReact } from 'ag-grid-react'

interface IUseAgGrid {
  isLoading: boolean
}
const getServerSideDatasource: (server: any) => any = (server: any) => ({
  getRows: (params) => {
    // adding delay to simulate real server call
    setTimeout(() => {
      const response = server.getResponse(params.request)
      if (response.success) {
        // call the success callback
        params.success({
          rowData: response.rows,
          rowCount: response.lastRow
        })
      } else {
        // inform the grid request failed
        params.fail()
      }
    }, 4000)
  }
})

const getFakeServer: (allData: any[]) => any = (allData: any[]) => ({
  getResponse: (request: any) => {
    console.log('asking for rows: ' + request.startRow + ' to ' + request.endRow)
    // take a slice of the total rows
    const rowsThisPage = allData.slice(request.startRow, request.endRow)
    // if on or after the last page, work out the last row.
    const lastRow = allData.length <= (request.endRow || 0) ? allData.length : -1
    return {
      success: true,
      rows: rowsThisPage,
      lastRow
    }
  }
})

const useAgGrid = ({ isLoading }: IUseAgGrid) => {
  const gridRef = useRef<AgGridReact | null>(null)

  useEffect(() => {
    if (isLoading && gridRef?.current?.api) {
      console.log('gridRef?.current?.api?.showLoadingOverlay()', gridRef?.current?.api)
      gridRef?.current?.api?.showLoadingOverlay()
    } else {
      gridRef?.current?.api?.hideOverlay()
    }
  }, [isLoading])

  //   useEffect(() => {
  //     fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
  //       .then((resp) => resp.json())
  //       .then((data: any[]) => {
  //         // add id to data
  //         let idSequence = 0
  //         data.forEach((item: any) => {
  //           item.id = idSequence++
  //         })
  //         console.log('DATA: ', data)
  //         const server: any = getFakeServer(data)
  //         console.log('SERVER: ', server)
  //         const datasource: any = getServerSideDatasource(server)
  //         console.log('DATASOURCE: ', gridRef?.current)
  //         gridRef?.current?.api!.setGridOption('serverSideDatasource', datasource)
  //       })
  //   }, [isLoading])

  // Function to retrieve selected rows
  const getSelectedRows = () => gridRef.current.api.getSelectedRows()

  // You can expose more grid API functions as needed
  const refreshGrid = () => gridRef.current.api.refreshCells()

  const selectAllRows = () => gridRef.current.api.selectAll()

  return { gridRef, getSelectedRows, refreshGrid, isTableLoading: isLoading, selectAllRows }
}

export default useAgGrid
