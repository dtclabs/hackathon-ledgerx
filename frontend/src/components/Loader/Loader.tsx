import { ILoader } from './interface'

const Loader: React.FC<ILoader> = ({ title, description, textColor }) => (
  <div className="flex flex-col justify-center items-center gap-2">
    <div className="animate-spin m-auto">
      <img src="/image/Load.png" alt="Load" className="fill-gray-800 text-gray-800" />
    </div>
    {title && <p className={`font-inter ${textColor ?? 'text-white'} `}>{title}</p>}
    {description && <p className={`font-inter font-lg  ${textColor ?? 'text-white'}`}>{description}</p>}
  </div>
)

export default Loader
