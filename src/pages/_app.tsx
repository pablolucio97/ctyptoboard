import { AppProps } from "next/app";

import { ChakraProvider } from "@chakra-ui/react";

import { theme } from "../styles/theme";
import { Layout } from '../components/Layout'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider resetCSS={false} theme={theme}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  )
}

export default MyApp