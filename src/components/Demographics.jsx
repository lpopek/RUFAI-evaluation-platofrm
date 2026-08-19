import React, { useState } from 'react'

export default function Demographics({ t, onStart }) {
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [exp, setExp] = useState('')
  const [consent, setConsent] = useState(false)

  // Auto-identyfikator sesji — uczestnik nic nie wpisuje. Grupuje wszystkie oceny
  // jednego uczestnika (potrzebne do analizy zgodnosci miedzy sedziami).
  const valid = age && gender && exp && consent

  const genId = () => 'participant-' + Math.random().toString(16).slice(2, 6)

  return (
    <div style={{ maxWidth: 520 }}>
      <h1>{t.demoH}</h1>
      <div className="card-panel">
        <div className="field">
          <label>{t.age}</label>
          <input type="number" min="0" value={age} onChange={(e) => setAge(e.target.value)} placeholder={t.agePh} />
        </div>
        <div className="field">
          <label>{t.gender}</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">{t.pick}</option>
            <option value="K">{t.gK}</option>
            <option value="M">{t.gM}</option>
            <option value="I">{t.gI}</option>
            <option value="N">{t.gN}</option>
          </select>
        </div>
        <div className="field" style={{ marginBottom: 8 }}>
          <label>{t.exp}</label>
          <select value={exp} onChange={(e) => setExp(e.target.value)}>
            <option value="">{t.pick}</option>
            <option value="brak">{t.expBrak}</option>
            <option value="podstawowe">{t.expPod}</option>
            <option value="srednie">{t.expSr}</option>
            <option value="eksperckie">{t.expEks}</option>
          </select>
        </div>
        <label className="consent">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>{t.consent}</span>
        </label>
      </div>
      <div style={{ marginTop: 24 }}>
        <button
          className="btn primary"
          disabled={!valid}
          onClick={() => onStart({ nick: genId(), age: Number(age), gender, exp })}
        >
          {t.start}
        </button>
      </div>
    </div>
  )
}
