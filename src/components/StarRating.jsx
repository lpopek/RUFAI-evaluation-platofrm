import React, { useState } from 'react'

export default function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="stars" role="radiogroup" aria-label="MOS 1-5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={'star' + ((hover || value) >= n ? ' filled' : '')}
          role="radio"
          aria-checked={value === n}
          tabIndex={0}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onChange(n) }}
        >
          ★
        </span>
      ))}
    </div>
  )
}
