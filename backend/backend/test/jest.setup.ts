// backend/test/jest.setup.ts

// 1) Web Streams
import { ReadableStream, WritableStream, TransformStream } from 'stream/web'
if (!(global as any).ReadableStream) (global as any).ReadableStream = ReadableStream
if (!(global as any).WritableStream) (global as any).WritableStream = WritableStream
if (!(global as any).TransformStream) (global as any).TransformStream = TransformStream

// 2) TextEncoder / TextDecoder
import { TextEncoder, TextDecoder } from 'util'
if (!(global as any).TextEncoder) (global as any).TextEncoder = TextEncoder
if (!(global as any).TextDecoder) (global as any).TextDecoder = TextDecoder as any

// 3) Blob / File / FormData
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Blob, File, FormData } = require('buffer')
  if (!(global as any).Blob) (global as any).Blob = Blob
  if (!(global as any).File) (global as any).File = File
  if (!(global as any).FormData) (global as any).FormData = FormData
} catch {
  /* ignore */
}

// 4) Worker channels (MessagePort/MessageChannel)
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { MessagePort, MessageChannel } = require('worker_threads')
  if (!(global as any).MessagePort) (global as any).MessagePort = MessagePort
  if (!(global as any).MessageChannel) (global as any).MessageChannel = MessageChannel
} catch {
  /* ignore */
}

// 5) DOMException (fix cho undici/websocket)
try {
  // ⚠️ require đúng export từ package 'domexception'
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const DOMExceptionModule = require('domexception')
  const DOMExceptionClass = DOMExceptionModule.DOMException || DOMExceptionModule.default || DOMExceptionModule

  if (typeof DOMExceptionClass === 'function') {
    ;(global as any).DOMException = DOMExceptionClass
  } else {
    console.warn('⚠️ DOMException polyfill not loaded correctly')
  }
} catch (err) {
  console.error('Failed to polyfill DOMException:', err)
}

// 6) Cuối cùng mới load undici (fetch/Headers/Request/Response)
;(async () => {
  // import undici as ESM (đúng kiểu ESM trong Node 18+)
  const undici = await import('undici')

  if (!(global as any).fetch) (global as any).fetch = undici.fetch
  if (!(global as any).Headers) (global as any).Headers = undici.Headers
  if (!(global as any).Request) (global as any).Request = undici.Request
  if (!(global as any).Response) (global as any).Response = undici.Response
})()
