interface ISearchBar {
  input: string
  setInput: (word: string) => void
  placeholder?: string
  width?: string
  bgColor?: string
}

const SearchBar: React.FC<ISearchBar> = ({
  setInput,
  placeholder,
  width = 'w-searchBar',
  bgColor = 'bg-transparent'
}) => (
  <div className={`${bgColor} relative`}>
    <div className="absolute top-1/3 left-6">
      <img aria-hidden src="/image/Search.png" alt="SearchIcon" />
    </div>
    <input
      className={`group-focus:border-gray-500 bg-transparent text-sm leading-5 focus:outline-none  h-10 font-inter tracking-wide border  border-[#D0D5DD] rounded-lg flex gap-4 items-center pr-4 pl-[52px] text-[#475467] hoverplaceholder:text-[#475467] group ${width}`}
      type="text"
      placeholder={placeholder || 'Search'}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
      }}
    />
  </div>
)

export default SearchBar
