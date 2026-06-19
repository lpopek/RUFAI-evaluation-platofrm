import React from 'react'

export default function Done({ t, count, onRestart }) {
  return (
    <div className="done">
      <div className="done-check">✓</div>
      <h1>{t.doneH}</h1>
      <p className="muted">{t.doneP(count)}</p>
      <button className="btn" style={{ marginTop: 16 }} onClick={onRestart}>{t.restart}</button>
    </div>
  )
}
