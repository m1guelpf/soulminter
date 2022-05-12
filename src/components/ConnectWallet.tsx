import { ConnectButton } from '@rainbow-me/rainbowkit'
import { FC } from 'react'
import { useAccount } from 'wagmi'

const ConnectWallet: FC<{ hideGuest?: boolean }> = ({ hideGuest = false }) => {
	const { data, isError, isLoading } = useAccount()

	if (hideGuest && !data?.address) return null

	return <ConnectButton />
}

export default ConnectWallet
