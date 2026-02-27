import { useState, useCallback, useEffect, useRef } from 'react'
import { playButtonSound } from './usePhoneSound'
import './index.scss'

const RING_URL = import.meta.env.BASE_URL + 'sounds/ring.mp3'
const DOG_URL = import.meta.env.BASE_URL + 'sounds/dog.mp3'
const HANGUP_URL = import.meta.env.BASE_URL + 'sounds/hangup.mp3'

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['*', '0', '#']
]

const LABELS = {
  '*': '＊', '#': '＃', '0': '0',
  '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6',
  '7': '7', '8': '8', '9': '9'
}

const formatDisplay = (str) =>
  str.replace(/\*/g, '＊').replace(/#/g, '＃')

const LETTERS = {
  '1': '', '2': 'ABC', '3': 'DEF', '4': 'GHI', '5': 'JKL', '6': 'MNO',
  '7': 'PQRS', '8': 'TUV', '9': 'WXYZ', '*': '', '0': '+', '#': ''
}

export default function App() {
  const [display, setDisplay] = useState('')
  const [callActive, setCallActive] = useState(false)
  const [dialedNumber, setDialedNumber] = useState('')
  const dialedRef = useRef('')
  const callAudioRef = useRef({ first: null, hangup: null })

  const onKey = useCallback((key) => {
    playButtonSound(key)
    if (!callActive) setDisplay((prev) => prev + key)
  }, [callActive])

  const onDelete = useCallback(() => {
    playButtonSound('1')
    if (!callActive) setDisplay((prev) => prev.slice(0, -1))
  }, [callActive])

  const endCall = useCallback(() => {
    const { first, hangup } = callAudioRef.current
    if (first) first.pause()
    if (hangup) hangup.pause()
    const h = new Audio(HANGUP_URL)
    h.play().catch(() => {})
    h.onended = () => {
      setCallActive(false)
      setDisplay('')
      setDialedNumber('')
    }
  }, [])

  const onCall = useCallback(() => {
    if (!display || callActive) return
    dialedRef.current = display
    setDialedNumber(display)
    setTimeout(() => setCallActive(true), 400)
  }, [display, callActive])

  useEffect(() => {
    if (!callActive) return

    const is110 = dialedRef.current === '110'
    const ringSound = new Audio(RING_URL)
    const hangup = new Audio(HANGUP_URL)
    const dogSound = is110 ? new Audio(DOG_URL) : null
    callAudioRef.current = { first: ringSound, second: dogSound, hangup }

    const cleanup = () => {
      setCallActive(false)
      setDisplay('')
      setDialedNumber('')
    }

    ringSound.play().catch(() => {})

    if (is110) {
      ringSound.onended = () => {
        dogSound.play().catch(() => {})
        dogSound.onended = () => {
          hangup.play().catch(() => {})
          hangup.onended = cleanup
        }
      }
    } else {
      ringSound.onended = () => {
        hangup.play().catch(() => {})
        hangup.onended = cleanup
      }
    }

    return () => {
      ringSound.pause()
      if (dogSound) dogSound.pause()
      hangup.pause()
    }
  }, [callActive])

  return (
    <div className="phone">
      <div className="status-bar">
        <span className="time">{`${new Date().getHours()}:${new Date().getMinutes()}`}</span>
        <span className="status-icons">
          <i className="fa-solid fa-signal" aria-hidden />
          <i className="fa-solid fa-battery-full" aria-hidden />
        </span>
      </div>

      <div
        className={`display${(callActive ? dialedNumber : display).length >= 20 ? ' display--long' : ''}${callActive ? ' display--calling' : ''}`}
        style={{ '--len': Math.max((callActive ? dialedNumber : display).length || 0, 1) }}
      >
        {callActive ? (
          <>
            <span className="display__calling-label">発信中…</span>
            <span className="display__number">{formatDisplay(dialedNumber)}</span>
          </>
        ) : (
          formatDisplay(display || ' ')
        )}
      </div>

      <div className="keypad">
        {KEYS.map((row) => (
          <div key={row.join('')} className="keypad-row">
            {row.map((key) => (
              <button
                key={key}
                type="button"
                className={`key${key === '*' || key === '#' ? ' key--symbol' : ''}`}
                onClick={() => onKey(key)}
                aria-label={LABELS[key] + (LETTERS[key] ? ` ${LETTERS[key]}` : '')}
              >
                <span className="key-main">{LABELS[key]}</span>
                <span className="key-sub">{LETTERS[key] || '\u00A0'}</span>
              </button>
            ))}
          </div>
        ))}
        <div className="call-row">
          <span className="call-row__spacer" aria-hidden />
          <button
            type="button"
            className={`call-btn${callActive ? ' call-btn--active' : ''}`}
            onClick={callActive ? endCall : onCall}
            disabled={!callActive && !display}
            aria-label={callActive ? '通話を終了' : '電話をかける'}
          >
            <i className="fa-solid fa-phone call-btn__icon" aria-hidden />
          </button>
          {display && !callActive ? (
            <button type="button" className="delete-btn" onClick={onDelete} aria-label="1つ消す">
              <i className="fa-solid fa-delete-left" aria-hidden />
            </button>
          ) : (
            <span className="call-row__spacer" aria-hidden />
          )}
        </div>
      </div>
    </div>
  )
}
