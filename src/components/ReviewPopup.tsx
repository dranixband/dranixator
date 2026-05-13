import { useRef, useState, useEffect, useCallback } from 'react'

const MIN_CHARS = 5
const MAX_CHARS = 150

interface ReviewPopupProps {
  songName: string
  onSubmit: (name: string, text: string) => void
  onClose: () => void
}

export default function ReviewPopup({ songName, onSubmit, onClose }: ReviewPopupProps) {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const charCount = text.length
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS
  const isOverLimit = charCount > MAX_CHARS

  // Focus textarea on mount
  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 100)
  }, [])

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Outside click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
      onClose()
    }
  }, [onClose])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    onSubmit(name.trim() || 'Anonymous', text.trim())
  }, [name, text, isValid, onSubmit])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 1000, pointerEvents: 'all' }}
      onMouseDown={handleBackdropClick}
      onClick={e => e.stopPropagation()}
    >
      <div
        ref={cardRef}
        className="review-popup-enter"
        style={{
          width: 380,
          background: 'linear-gradient(160deg, #0c1a12 0%, #0a1510 50%, #0d1c14 100%)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
          borderRadius: 12,
          padding: 24,
          boxShadow: `
            0 0 40px rgba(0,0,0,0.6),
            0 0 20px rgba(34,197,94,0.08),
            inset 0 1px 0 rgba(255,255,255,0.04)
          `,
          pointerEvents: 'all',
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 10,
              fontFamily: 'monospace',
              color: 'rgba(34,197,94,0.5)',
              textTransform: 'uppercase',
              letterSpacing: 2,
              marginBottom: 4,
            }}
          >
            Leave a review
          </div>
          <div
            style={{
              fontSize: 18,
              fontFamily: 'monospace',
              color: '#f5c542',
              fontWeight: 700,
            }}
          >
            {songName}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name input */}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontFamily: 'monospace',
                color: 'rgba(255,255,255,0.35)',
                marginBottom: 5,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Anonymous"
              maxLength={30}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 14,
                fontFamily: 'monospace',
                color: '#e0e0e0',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(34,197,94,0.15)',
                borderRadius: 6,
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(34,197,94,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(34,197,94,0.15)'}
            />
          </div>

          {/* Review textarea */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontFamily: 'monospace',
                color: 'rgba(255,255,255,0.35)',
                marginBottom: 5,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Review
            </label>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value.slice(0, MAX_CHARS + 10))}
              placeholder="What do you think about this song?"
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 14,
                fontFamily: 'monospace',
                color: '#e0e0e0',
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${isOverLimit ? 'rgba(255,59,92,0.5)' : 'rgba(34,197,94,0.15)'}`,
                borderRadius: 6,
                outline: 'none',
                resize: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                lineHeight: 1.5,
              }}
              onFocus={e => {
                if (!isOverLimit) e.target.style.borderColor = 'rgba(34,197,94,0.4)'
              }}
              onBlur={e => {
                if (!isOverLimit) e.target.style.borderColor = 'rgba(34,197,94,0.15)'
              }}
            />

            {/* Char counter */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 5,
                fontSize: 11,
                fontFamily: 'monospace',
              }}
            >
              <span style={{ color: charCount < MIN_CHARS ? 'rgba(255,255,255,0.25)' : 'rgba(34,197,94,0.5)' }}>
                {charCount < MIN_CHARS ? `${MIN_CHARS - charCount} more chars needed` : 'Ready'}
              </span>
              <span
                style={{
                  color: isOverLimit
                    ? '#ff3b5c'
                    : charCount > MAX_CHARS - 20
                      ? '#f5c542'
                      : 'rgba(255,255,255,0.2)',
                }}
              >
                {charCount}/{MAX_CHARS}
              </span>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!isValid}
            style={{
              width: '100%',
              padding: '10px 0',
              fontSize: 13,
              fontFamily: 'monospace',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 2,
              color: isValid ? '#0a1510' : 'rgba(255,255,255,0.15)',
              background: isValid
                ? 'linear-gradient(135deg, #f5c542 0%, #d4a030 100%)'
                : 'rgba(255,255,255,0.05)',
              border: isValid
                ? '1px solid rgba(245,197,66,0.6)'
                : '1px solid rgba(255,255,255,0.06)',
              borderRadius: 6,
              cursor: isValid ? 'pointer' : 'default',
              transition: 'all 0.3s ease',
              boxShadow: isValid
                ? '0 0 15px rgba(245,197,66,0.2), 0 0 30px rgba(245,197,66,0.05)'
                : 'none',
            }}
          >
            Connect Node
          </button>
        </form>
      </div>
    </div>
  )
}
