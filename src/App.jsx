import { useState } from 'react'
import { Scanner } from './components/Scanner'
import { History } from './components/History'
import './App.css'

export function App() {
  const [results, setResults] = useState([])
  const [activeTab, setActiveTab] = useState('scanner')

  const addResult = (text) => {
    setResults((prev) => {
      const exists = prev.find((r) => r.text === text)
      if (exists) return prev
      return [{ id: Date.now(), text, time: new Date().toLocaleTimeString() }, ...prev]
    })
  }

  const clearHistory = () => setResults([])

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span className="logo-icon">▩</span>
          <span className="logo-text">Bar Reader</span>
        </div>
        <nav className="tabs">
          <button
            className={`tab-btn ${activeTab === 'scanner' ? 'active' : ''}`}
            onClick={() => setActiveTab('scanner')}
          >
            Scanner
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History {results.length > 0 && <span className="badge">{results.length}</span>}
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'scanner' && <Scanner onResult={addResult} />}
        {activeTab === 'history' && <History results={results} onClear={clearHistory} />}
      </main>
    </div>
  )
}
