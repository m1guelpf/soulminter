import { FC } from 'react'
import Layout from '@/components/Layout'
import dynamic from 'next/dynamic'
const ConnectWallet = dynamic(() => import('@/components/ConnectWallet'), { ssr: false })
const MintForm = dynamic(() => import('@/components/MintForm'), { ssr: false })

const Index: FC = () => {
	return (
		<Layout>
			<div className="space-y-10">
				<header className="mb-4">
					<div className="space-y-2.5 mb-4">
						<h1 className="text-white font-semibold text-5xl">Soulminter</h1>

						<p className="text-gray-500 text-xl">One-click mint for Soulbound NFTs on Optimism.</p>
					</div>
					<ConnectWallet hideGuest />
				</header>
				<MintForm />
			</div>
			<p className="absolute bottom-4 md:bottom-6 inset-x-0 text-center text-white">
				Built by{' '}
				<a className="font-semibold" href="https://twitter.com/m1guelpf" target="_blank" rel="noreferrer">
					@m1guelpf
				</a>
			</p>
		</Layout>
	)
}

export default Index
