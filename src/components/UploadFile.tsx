import { MediaPicker } from 'degen'
import { NFTStorage } from 'nft.storage'
import { FC, useEffect, useMemo, useState } from 'react'

const UploadFile: FC<{
	onChange?: (string) => void
	onFileLoad?: (File) => void
	nft: { name: string; description: string }
}> = ({ onChange = () => null, onFileLoad = () => null, nft: { name, description } }) => {
	const [file, setFile] = useState<File>(null)
	const [fileURI, setFileURI] = useState<string>(null)
	const [isUploading, setUploading] = useState<boolean>(false)

	const client = useMemo(() => new NFTStorage({ token: process.env.NEXT_PUBLIC_IPFS_TOKEN }), [])

	const onFileUpload = file => {
		setUploading(true)

		setFile(file)
	}

	useEffect(() => {
		onFileLoad(file)

		if (file)
			client
				.store({ image: file, name, description, properties: { Soulbound: true } })
				.then(metadata => setFileURI(metadata.url))
		else setFileURI(null)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [file])

	useEffect(() => {
		setUploading(false)
		onChange(fileURI)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fileURI])

	return (
		<MediaPicker
			accept="image/jpeg, image/png, image/webp, image/gif"
			label="Upload media"
			required
			uploading={isUploading}
			uploaded={!!fileURI}
			onChange={onFileUpload}
		/>
	)
}

export default UploadFile
