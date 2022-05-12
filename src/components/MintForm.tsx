import UploadFile from './UploadFile'
import { useAccount, useContractWrite, useNetwork } from 'wagmi'
import SoulMinterABI from '@/abi/SoulMinter.abi.json'
import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from 'react'
import { Button, Card, Field, FieldSet, Heading, Input, Text } from 'degen'
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import ConnectWallet from './ConnectWallet'
import { CONTRACT_ADDR } from '@/lib/consts'

enum FORM_STATES {
	CONNECT_WALLET,
	METADATA,
	MEDIA,
	CONFIRMED,
}

const MintForm: FC = () => {
	const [formState, setFormState] = useState<FORM_STATES>(FORM_STATES.CONNECT_WALLET)
	const [name, setName] = useState<string>('')
	const [description, setDescription] = useState<string>('')
	const [txHash, setTxHash] = useState<string>(null)
	const { data: connectedWallet } = useAccount()

	useEffect(() => {
		setFormState(connectedWallet?.address ? FORM_STATES.METADATA : FORM_STATES.CONNECT_WALLET)
	}, [connectedWallet])

	const formPage = useMemo(() => {
		switch (formState) {
			case FORM_STATES.CONNECT_WALLET:
				return <ConnectWalletState />
			case FORM_STATES.METADATA:
				return (
					<MetadataState
						{...{
							name,
							setName,
							description,
							setDescription,
							submitForm: () => setFormState(FORM_STATES.MEDIA),
						}}
					/>
				)
			case FORM_STATES.MEDIA:
				return (
					<MediaState
						{...{
							name,
							description,
							setFormState,
							setTxHash,
						}}
					/>
				)

			case FORM_STATES.CONFIRMED:
				return <ConfirmedState txHash={txHash} />
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [name, description, formState])

	return (
		<Card padding="6" shadow>
			<Heading>Create a Soulbound NFT</Heading>
			<div className="mt-2 space-y-1">
				<Text>
					Soulbound NFTs are tokens you mint to an address, and then can&apos;t move afterwards. The term was{' '}
					<a
						className="underline"
						target="_blank"
						href="https://vitalik.ca/general/2022/01/26/soulbound.html"
						rel="noreferrer"
					>
						coined by Vitalik
					</a>
					, and has been gaining more and more adoption over the past few months.
				</Text>
				<Text>
					The form below allows you to <b>issue Soulbound NFTs</b> to any address with{' '}
					<b>just a few clicks</b>.
				</Text>
			</div>
			{formPage}
		</Card>
	)
}

const ConnectWalletState: FC = () => {
	return (
		<div className="mt-3 flex flex-col items-center justify-center space-y-3">
			<p className="text-gray-200 text-center font-medium">Please connect your wallet to continue.</p>
			<ConnectWallet />
		</div>
	)
}

const MetadataState: FC<{
	name: string
	setName: Dispatch<SetStateAction<string>>
	description: string
	setDescription: Dispatch<SetStateAction<string>>
	submitForm: () => void
}> = ({ name, setName, description, setDescription, submitForm }) => {
	const [errors, setErrors] = useState({ name: null, description: null })

	const validateAndSubmit = event => {
		event.preventDefault()

		setErrors({ name: !name, description: !description })

		if (name && description) submitForm()
	}

	return (
		<form onSubmit={validateAndSubmit}>
			<FieldSet legend="">
				<Input
					label="Name"
					placeholder="My Soulbound NFT"
					required={true}
					value={name}
					error={errors.name && 'The name field is required.'}
					onChange={event => setName(event.target.value)}
					onBlur={() => setErrors({ ...errors, name: null })}
				/>
				<Input
					label="Description"
					placeholder="You can't transfer this NFT!"
					required
					value={description}
					error={errors.description && 'The description field is required.'}
					onChange={event => setDescription(event.target.value)}
					onBlur={() => setErrors({ ...errors, description: null })}
				/>
			</FieldSet>
			<div className="mt-6 flex justify-end">
				<Button variant="primary">Continue</Button>
			</div>
		</form>
	)
}

const MediaState: FC<{
	name: string
	description: string
	setTxHash: Dispatch<SetStateAction<string>>
	setFormState: (FORM_STATES) => void
}> = ({ name, description, setTxHash, setFormState }) => {
	const { activeChain } = useNetwork()
	const addRecentTransaction = useAddRecentTransaction()

	const [ipfsURI, setIpfsURI] = useState<string>(null)
	const [receiverAddress, setReceiverAddress] = useState<string>('')
	const [errors, setErrors] = useState({ receiverAddress: null, ipfsURI: null })

	const {
		data: txData,
		isError,
		isLoading,
		write,
	} = useContractWrite(
		{
			addressOrName: CONTRACT_ADDR[activeChain.id],
			contractInterface: SoulMinterABI,
		},
		'mint',
		{
			onSuccess: txData => {
				setTxHash(txData.hash)
				addRecentTransaction({
					hash: txData.hash,
					description: `"${name}" Soulbound NFT mint`,
				})
				setFormState(FORM_STATES.CONFIRMED)
			},
			onError: error => alert(error.message),
		}
	)

	const validateAndSubmit = event => {
		event.preventDefault()

		setErrors({ receiverAddress: !receiverAddress, ipfsURI: !ipfsURI })

		console.log(receiverAddress, ipfsURI)

		if (receiverAddress && ipfsURI) write({ args: [receiverAddress, ipfsURI] })
	}

	return (
		<form onSubmit={validateAndSubmit} className="px-4 py-5 sm:px-6">
			<FieldSet legend="">
				<Input
					label="Receiver Address"
					description="The Ethereum address that will own this NFT"
					placeholder="0xe340b00b6b622c136ffa5cff130ec8edcddcb39d"
					error={errors.receiverAddress && 'Someone needs to own the NFT!'}
					value={receiverAddress}
					required={true}
					onChange={event => setReceiverAddress(event.target.value)}
					onBlur={() => setErrors({ ...errors, receiverAddress: null })}
				/>
				<Field label="Image" description="The media attached to your NFT.">
					<UploadFile nft={{ name, description }} onChange={imageURI => setIpfsURI(imageURI)} />
				</Field>
			</FieldSet>
			<div className="mt-6 flex justify-end">
				<Button loading={isLoading} disabled={isLoading}>
					Mint
				</Button>
			</div>
		</form>
	)
}

const ConfirmedState: FC<{ txHash: string }> = ({ txHash }) => {
	const { activeChain } = useNetwork()

	return (
		<div className="mt-4">
			<p className="text-white text-lg mb-6">Your Soulbound NFT has been minted!</p>
			<div className="flex justify-center">
				<Button
					as="a"
					variant="secondary"
					href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
						'https://soulminter.m1guelpf.me'
					)}&text=${encodeURIComponent('✨ Just minted a Soulbound NFT on\n\n')}`}
					target="_blank"
					rel="noreferrer"
				>
					Share on Twitter
				</Button>
			</div>
			<Button as="a" href={`${activeChain.blockExplorers.default.url}/tx/${txHash}`} target="_blank">
				View on Etherscan
			</Button>
		</div>
	)
}

export default MintForm
