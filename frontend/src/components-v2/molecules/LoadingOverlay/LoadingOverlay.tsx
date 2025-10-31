import { LoaderLX } from '@/components-v2/LoaderLX'

const LoadingOverlay = () => (
  <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50  flex flex-col items-center justify-center">
    <div className="absolute " style={{ zIndex: 1000 }}>
      <LoaderLX />
    </div>
    <div className="z-50 overflow-hidden bg-gray-400 opacity-75 top-0 left-0 right-0 bottom-0 w-full h-screen " />
  </div>
)

export default LoadingOverlay
