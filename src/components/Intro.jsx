import React from 'react'

export default function Intro({ t, onNext }) {
  return (
    <div>
      <h1>{t.introH}</h1>
      <div className="card-panel">
        <p style={{ marginTop: 0 }}>{t.introP1}</p>
        <p>{t.introP2}</p>
        <ol>
          <li><strong>{t.introLi1a}</strong>{t.introLi1b}</li>
          <li><strong>{t.introLi2a}</strong>{t.introLi2b}</li>
        </ol>
        <p>{t.introP3a}<strong>{t.introP3b}</strong>{t.introP3c}</p>
        <p className="muted small" style={{ marginBottom: 0 }}>{t.introNote}</p>
      </div>
      <div style={{ marginTop: 24 }}>
        <button className="btn primary" onClick={onNext}>{t.next}</button>
      </div>
    </div>
  )
}
