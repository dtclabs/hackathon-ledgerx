import { FC, HTMLAttributes } from 'react'

// interface IListViewProps {
//   children: string | JSX.Element | JSX.Element[]
// }

interface IListViewComposition {
  Content?: FC<any>
  Header?: FC<any>
}

export interface IProps extends HTMLAttributes<HTMLDivElement>, IListViewComposition {
  height?: string
}

const ListView = ({ children }: IProps) => (
  <div className="bg-white rounded-2xl font-inter shadow-free-modal mr-4 ">{children}</div>
)

interface IHeaderComposiiton {
  Title?: FC<any>
}

export interface IHeaderProps extends HTMLAttributes<HTMLDivElement>, IHeaderComposiiton {}

const Header: any = ({ children }: IHeaderProps) => (
  <div className="flex flex-row  px-[24px] py-[20px]" style={{ borderBottom: '1px solid #EAECF0' }}>
    {children}
  </div>
)

const Title: any = ({ children }) => <div className="text-[24px] font-medium">{children}</div>

const Content: any = ({ children, className }) => <div className={` ${className} px-[24px] pt-[20px]`}>{children}</div>

ListView.Header = Header
ListView.Header.Title = Title
ListView.Content = Content

export default ListView
