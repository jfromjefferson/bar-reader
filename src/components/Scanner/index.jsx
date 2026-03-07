import { useState, useRef, useEffect } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'
import { ResultCard } from '../ResultCard'
import './styles.css'

export function Scanner({ onResult }) {
	const [mode, setMode] = useState('screen')
	const [result, setResult] = useState(null)
	const [error, setError] = useState(null)
	const [previewSrc, setPreviewSrc] = useState(null)

	const readerRef = useRef(null)

	useEffect(() => {
		readerRef.current = new BrowserMultiFormatReader()
		return () => {
			readerRef.current?.reset()
		}
	}, [])

	useEffect(() => {
		if (typeof chrome !== 'undefined' && chrome.storage?.session) {
			chrome.storage.session.get(['capturedImage'], (res) => {
				if (res.capturedImage) {
					chrome.storage.session.remove('capturedImage')
					setMode('screen')
					decodeFromUrl(res.capturedImage)
					setPreviewSrc(res.capturedImage)
				}
			})
		}
	}, [])

	const decodeFromUrl = async (url) => {
		setError(null)
		setResult(null)
		try {
			const res = await readerRef.current.decodeFromImageUrl(url)
			const text = res.getText()
			setResult(text)
			onResult(text)
		} catch {
			setError('No barcode or QR code found in the selected area.')
		}
	}

	const handleScreenCapture = () => {
		if (typeof chrome !== 'undefined' && chrome.runtime) {
			setMode('screen')
			setResult(null)
			setError(null)
			setPreviewSrc(null)
			chrome.runtime.sendMessage({ action: 'startCapture' })
		} else {
			setError('Screen capture is only available as a browser extension.')
		}
	}

	return (
		<div className="scanner">
			{!previewSrc && !result && !error && (
				<div className="screen-capture-section">
					<div className="screen-capture-hint">
						<div className="screen-capture-icon">🖼</div>
						<p className="drop-title">Select an area on screen</p>
						<p className="drop-sub">Click and drag over the barcode or QR code</p>
						<button className="start-btn screen-capture-btn" onClick={handleScreenCapture}>
							⊹ Select Area Again
						</button>
					</div>
				</div>
			)}

			{previewSrc && (
				<div className="preview-section">
					<img src={previewSrc} alt="captured area" className="preview-img" />
					<button className="reset-btn" onClick={handleScreenCapture}>⊹ Capture Again</button>
				</div>
			)}

			{error && (
				<div className="alert alert-error">
					<span>⚠</span> {error}
				</div>
			)}

			{result && <ResultCard text={result} onReset={undefined} />}
		</div>
	)
}
