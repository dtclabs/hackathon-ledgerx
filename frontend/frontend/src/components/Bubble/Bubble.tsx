const Bubble = () => (
  <>
    <div className="absolute z-behind bg-red-100 w-44 h-44 rounded-full left-6 top-20 overflow-hidden" />
    <div className="fixed z-behind bg-red-100 w-80 h-80 rounded-full -left-20 -bottom-20 overflow-hidden" />
    <div className="absolute z-behind bg-yellow-100 w-20 h-20 rounded-full left-32 bottom-80 overflow-hidden" />
    <div className="absolute z-behind bg-yellow-100 w-20 h-20 rounded-full right-52 bottom-2/4 overflow-hidden" />
    <div className="absolute z-behind bg-gray-200 w-8 h-8 rotate-12 left-48 bottom-2/4 overflow-hidden" />
    <div className="absolute z-behind bg-gray-200 w-8 h-8 rotate-12 right-80 bottom-40 overflow-hidden" />
    <div className="absolute z-behind bg-gray-200 opacity-100 w-3 h-3 rotate-12 right-48 top-80 overflow-hidden" />
    <div className="absolute z-behind bg-blue-300 w-24 h-24 rounded-full right-px bottom-0 overflow-y-hidden" />
    <div className="absolute z-behind bg-red-100 w-9 h-9 rounded-full right-16 top-48 overflow-hidden" />
    <div className="absolute z-behind bg-red-100 w-0 h-0 rounded-full right-16 top-48 overflow-hidden" />
    <div className="absolute -z-10 bg-gray-50 h-full w-full top-0 overflow-hidden" />
  </>
)

export default Bubble
