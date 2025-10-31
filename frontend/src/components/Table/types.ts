export interface ITableBodyProps {
  dataBody: IDataBody[]
  classNameTd?: string
  classNameTr?: string
}

export interface ITableHeaderProps {
  dataHeader: IDataHeader[]
  classNameTd?: string
}

export interface IDataBody {
  data: IData[]
  id?: string
}

export interface IData {
  id?: string
  label: string | JSX.Element | boolean
}

export interface IDataHeader {
  id?: string
  label: string
}