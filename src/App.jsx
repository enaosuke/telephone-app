import { useState, useCallback } from 'react'
import { playButtonSound, playCallSound } from './usePhoneSound'
import './App.css'

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#']
]

const LABELS = {
  '*': '☆',
  '#': '♯',
  '0': '0',
  '1': '1', '2': '2', '3': '3',
  '4': '4', '5': '5', '6': '6',
  '7': '7', '8': '8', '9': '9'
}

export default function App() {
  const [display, setDisplay] = useState('')
  const [callActive, setCallActive] = useState(false)

  const onKey = useCallback((key) => {
    playButtonSound(key)
    if (callActive) return
    setDisplay((prev) => prev + key)
  }, [callActive])

  const onDelete = useCallback(() => {
    playButtonSound('1')
    if (callActive) return
    setDisplay((prev) => prev.slice(0, -1))
  }, [callActive])

  const onCall = useCallback(() => {
    if (!display || callActive) return
    playCallSound()
    setDisplay('')
    // 一瞬「空」を見せてから「かけちゅう…」表示（流れが分かりやすく）
    setTimeout(() => setCallActive(true), 400)
    setTimeout(() => setCallActive(false), 400 + 3000)
  }, [display, callActive])

  return (
    <div className="phone">
      <div className="safe-top" />
      <header className="header">
        <div className="status-bar">
          <span className="time">{new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="status-icons">📶 🔋</span>
        </div>
      </header>

      <div className="display-wrap">
        <div className="display">
          {display || (callActive ? 'かけちゅう…' : ' ')}
          {display && !callActive && (
            <button type="button" className="delete-btn" onClick={onDelete} aria-label="1つ消す">
              ⌫
            </button>
          )}
        </div>
      </div>

      <div className="keypad">
        {KEYS.map((row) => (
          <div key={row.join('')} className="keypad-row">
            {row.map((key) => (
              <button
                key={key}
                type="button"
                className="key"
                onClick={() => onKey(key)}
                aria-label={LABELS[key]}
              >
                <span className="key-main">{LABELS[key]}</span>
                {['2', '5', '8', '0'].includes(key) && (
                  <span className="key-sub">
                    {key === '2' && 'ABC'}
                    {key === '5' && 'JKL'}
                    {key === '8' && 'TUV'}
                    {key === '0' && '+'}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
        <div className="keypad-row call-row">
          <button
            type="button"
            className="call-btn"
            onClick={onCall}
            disabled={!display || callActive}
            aria-label="電話をかける"
          >
            {callActive ? '📵' : '📞'}
          </button>
        </div>
      </div>

      <div className="safe-bottom" />
    </div>
  )
}
