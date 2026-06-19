import React, { useEffect, useState } from 'react'
import { T } from './i18n.jsx'
import Header from './components/Header.jsx'
import Intro from './components/Intro.jsx'
import Demographics from './components/Demographics.jsx'
import TaskCard from './components/TaskCard.jsx'
import Done from './components/Done.jsx'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function App() {
  const [lang, setLang] = useState('pl')
  const [screen, setScreen] = useState('loading') // loading | intro | demo | task | done | error
  const [tasks, setTasks] = useState([])
  const [participant, setParticipant] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [order, setOrder] = useState([])
  const [pos, setPos] = useState(0)
  const [savedCount, setSavedCount] = useState(0)
  const [busy, setBusy] = useState(false)
  const t = T[lang]

  // Wczytaj zadania z backendu
  useEffect(() => {
    fetch('/api/tasks')
      .then((r) => { if (!r.ok) throw new Error('http ' + r.status); return r.json() })
      .then((d) => { setTasks(d.tasks || []); setScreen('intro') })
      .catch(() => setScreen('error'))
  }, [])

  const startStudy = (p) => {
    setParticipant(p)
    setSessionId(`${p.nick}-${Date.now()}`)
    setOrder(shuffle(tasks))
    setPos(0)
    setSavedCount(0)
    setScreen('task')
  }

  // Zapis pojedynczej oceny do backendu (Vercel KV).
  // Metryczka doklejana do każdego wpisu — wygodne w analizie CSV.
  const persist = async (entry) => {
    const body = {
      type: 'evaluation',
      taskId: entry.taskId,
      rater: participant.nick,
      sessionId,
      participant,
      lang,
      scores: entry.scores,
      ranking: entry.ranking,
    }
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error('save failed')
  }

  const handleSubmit = async (entry) => {
    setBusy(true)
    try {
      await persist(entry)
      setSavedCount((c) => c + 1)
      if (pos + 1 < order.length) setPos(pos + 1)
      else setScreen('done')
    } catch {
      alert(t.saveErr)
    } finally {
      setBusy(false)
    }
  }

  const handleExit = async (entry) => {
    setBusy(true)
    try {
      if (entry && entry.complete) {
        await persist(entry)
        setSavedCount((c) => c + 1)
      }
    } catch {
      // nawet przy błędzie zapisu bieżącej, wcześniejsze są już w bazie
    } finally {
      setBusy(false)
      setScreen('done')
    }
  }

  const wrap = (child) => (
    <div className="page">
      <Header t={t} lang={lang} setLang={setLang} />
      <div className="app">{child}</div>
    </div>
  )

  if (screen === 'loading') return wrap(<p className="muted">{t.loading}</p>)
  if (screen === 'error') return wrap(<p className="muted">{t.loadErr}</p>)
  if (screen === 'intro') return wrap(<Intro t={t} onNext={() => setScreen('demo')} />)
  if (screen === 'demo') return wrap(<Demographics t={t} onStart={startStudy} />)
  if (screen === 'done') return wrap(<Done t={t} count={savedCount} onRestart={() => setScreen('intro')} />)

  return wrap(
    <TaskCard
      key={order[pos].id}
      t={t}
      lang={lang}
      task={order[pos]}
      index={pos}
      total={order.length}
      busy={busy}
      onSubmit={handleSubmit}
      onExit={handleExit}
    />
  )
}
