import { useState } from 'react'
import { ResultCard } from './ResultCard'
import './History.css'

export function History({ results, onClear }) {
  const [search, setSearch] = useState('')

  const filtered = results.filter((r) =>
    r.text.toLowerCase().includes(search.toLowerCase())
  )

  if (results.length === 0) {
    return (
      <div className="history-empty">
        <div className="empty-icon">📋</div>
        <p className="empty-title">No scans yet</p>
        <p className="empty-sub">Scan a barcode or QR code and it will appear here.</p>
      </div>
    )
  }

  return (
    <div className="history">
      <div className="history-toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search results..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="clear-btn" onClick={onClear}>🗑 Clear all</button>
      </div>

      {filtered.length === 0 ? (
        <p className="no-results">No results match your search.</p>
      ) : (
        <div className="history-list">
          {filtered.map((r) => (
            <div key={r.id} className="history-item">
              <span className="item-time">{r.time}</span>
              <ResultCard text={r.text} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
