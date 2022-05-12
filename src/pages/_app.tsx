import 'degen/styles'
import { FC } from 'react'
import '@fontsource/inter'
import 'tailwindcss/tailwind.css'
import { AppProps } from 'next/app'
import '@fontsource/ia-writer-mono'
import { ThemeProvider } from 'degen'
import '@rainbow-me/rainbowkit/styles.css'
import { chain, createClient, WagmiProvider } from 'wagmi'
import { apiProvider, configureChains, getDefaultWallets, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'

const { chains, provider } = configureChains(
	[chain.mainnet, chain.optimism, chain.optimismKovan, chain.polygon, chain.polygonMumbai],
	[apiProvider.infura(process.env.NEXT_PUBLIC_INFURA_ID), apiProvider.fallback()]
)

const { connectors } = getDefaultWallets({ appName: 'Soulminter', chains })
const wagmiClient = createClient({ autoConnect: true, connectors, provider })

const App: FC<AppProps> = ({ Component, pageProps }) => {
	return (
		<WagmiProvider client={wagmiClient}>
			<RainbowKitProvider
				chains={chains}
				showRecentTransactions={true}
				theme={darkTheme({ accentColor: '#5E5CDE' })}
			>
				<ThemeProvider defaultAccent="indigo" defaultMode="dark">
					<Component {...pageProps} />
				</ThemeProvider>
			</RainbowKitProvider>
		</WagmiProvider>
	)
}

export default App
