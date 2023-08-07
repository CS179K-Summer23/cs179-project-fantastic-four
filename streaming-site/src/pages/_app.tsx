import type { AppProps } from 'next/app'
import '../styles/globals.css'
import 'video.js/dist/video-js.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 inset-0 absolute h-full w-full overflow-auto">
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp
