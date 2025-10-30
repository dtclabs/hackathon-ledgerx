interface ChildProps {
  children: React.ReactNode
  extendedClass?: string
  tableRef?: any
  onClick?: (event) => void
}

interface BaseTableChildren extends React.FC<ChildProps> {
  Header: HeaderWithChildren
  Body: BodyWithChildren
}

interface BodyWithChildren extends React.FC<ChildProps> {
  Row: RowWithChildren
}

interface RowWithChildren extends React.FC<ChildProps> {
  Cell: React.FC<any>
}

interface HeaderWithChildren extends React.FC<ChildProps> {
  Row: HeaderRowWithChildren
  extendClass?: string
}

interface HeaderRowWithChildren extends React.FC<ChildProps> {
  Cell: React.FC<any>
}

const BaseTable: BaseTableChildren = ({ children, extendedClass, tableRef, ...rest }) => (
  <table
    {...rest}
    ref={tableRef}
    className={`table shadow overflow-auto rounded-lg border-[#CECECC]  scrollbar w-full h-full font-inter divide-y divide-[#CECECC] border-1 ${extendedClass}`}
  >
    {children}
  </table>
)

const Header: HeaderWithChildren = ({ children, extendedClass, ...rest }) => (
  <thead className={`bg-grey-100 rounded-t-lg sticky top-0 z-10 ${extendedClass}`}>{children}</thead>
)

const HeaderCell: any = ({ children, extendedClass, ...rest }) => (
  <th
    {...rest}
    className={`group px-6 py-3 text-left text-xs font-medium text-gray-500 capitalize tracking-wider border-0 ${extendedClass}`}
  >
    {children}
  </th>
)
const Body: any = ({ children, extendedClass, ...rest }) => (
  <tbody {...rest} className={`bg-white divide-y divide-[#CECECC] rounded-b-lg ${extendedClass}`}>
    {children}
  </tbody>
)

const Row: any = ({ children, extendedClass, ...rest }) => (
  <tr {...rest} className={extendedClass}>
    {children}
  </tr>
)

const RowCell: any = ({ children, extendedClass, ...rest }) => (
  <td {...rest} style={{ fontSize: 14, color: '#2D2D2C' }} className={`px-6 py-4 font-sm ${extendedClass}`}>
    {children}
  </td>
)

const HeaderRow: HeaderRowWithChildren = ({ children, extendedClass, ...rest }) => (
  <tr {...rest} className="rounded-t-lg">
    {children}
  </tr>
)

BaseTable.Header = Header
Header.Row = HeaderRow
HeaderRow.Cell = HeaderCell

BaseTable.Body = Body
Body.Row = Row
Row.Cell = RowCell

export default BaseTable
