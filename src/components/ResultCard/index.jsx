import { useState } from 'react'
import './styles.css'

export function ResultCard({ text, onReset }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isUrl = /^https?:\/\//i.test(text)

  return (
    <div className="result-card">
      <div className="result-header">
        <span className="result-label">✓ Result</span>
        {isUrl && (
          <a href={text} target="_blank" rel="noreferrer" className="open-link">
            Open URL ↗
          </a>
        )}
      </div>
      <div className="result-text">{text}</div>
      <div className="result-actions">
        <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
        {onReset && (
          <button className="scan-again-btn" onClick={onReset}>
            ↻ Scan another
          </button>
        )}
      </div>
    </div>
  )
}
