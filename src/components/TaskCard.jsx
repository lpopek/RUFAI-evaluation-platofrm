import React, { useState } from 'react'
import StarRating from './StarRating.jsx'

export default function TaskCard({ t, lang, task, index, total, busy, onSubmit, onExit }) {
  const [scores, setScores] = useState({})
  const [ranking, setRanking] = useState({})

  const canMos = task.images.every((img) => scores[img.id] > 0)
  const canRank = Object.keys(ranking).length === task.images.length
  const ready = canMos && canRank

  const assignRank = (imgId, pos) => {
    const next = { ...ranking }
    for (const k of Object.keys(next)) if (next[k] === pos) delete next[k]
    if (ranking[imgId] === pos) delete next[imgId]
    else next[imgId] = pos
    setRanking(next)
  }

  const payload = () => ({
    taskId: task.id,
    scores: { ...scores },
    ranking: { ...ranking },
    complete: ready,
  })

  return (
    <div>
      <div className="task-nav">
        <span className="counter">{t.tripleOf(index + 1, total)}</span>
        <button className="btn" disabled={busy} onClick={() => onExit(payload())}>{t.exit}</button>
      </div>

      <div className="prompt-card">
        <div className="label">{t.promptLabel}</div>
        <div className="prompt-text">{task.prompt[lang]}</div>
      </div>

      <div className="section-label">{t.sec1}</div>
      <div className="grid" style={{ marginBottom: 28 }}>
        {task.images.map((img) => (
          <div className="card" key={img.id}>
            <img src={img.url} alt={img.id} loading="lazy" />
            <div className="body">
              <StarRating value={scores[img.id] || 0} onChange={(n) => setScores({ ...scores, [img.id]: n })} />
            </div>
          </div>
        ))}
      </div>

      <div className="section-label">{t.sec2}</div>
      <div className="grid">
        {task.images.map((img) => (
          <div className="card-wrap" key={img.id}>
            {ranking[img.id] && <div className="rank-badge">{ranking[img.id]}</div>}
            <div className="card">
              <img src={img.url} alt={img.id} loading="lazy" />
              <div className="body">
                <div className="rank-controls">
                  {[1, 2, 3].map((pos) => (
                    <button
                      key={pos}
                      className={'rank-btn' + (ranking[img.id] === pos ? ' assigned' : '')}
                      onClick={() => assignRank(img.id, pos)}
                    >
                      {pos}.
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="actions">
        <button className="btn primary" disabled={!ready || busy} onClick={() => onSubmit(payload())}>
          {busy ? t.saving : (index + 1 < total ? t.saveNext : t.saveEnd)}
        </button>
        {!canMos && <span className="muted small">{t.needMos}</span>}
        {canMos && !canRank && <span className="muted small">{t.needRank}</span>}
      </div>
    </div>
  )
}
