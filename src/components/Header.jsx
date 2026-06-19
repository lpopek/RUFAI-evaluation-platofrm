import React from 'react'

export default function Header({ t, lang, setLang }) {
  const langBtn = (code, label) => (
    <button
      onClick={() => setLang(code)}
      style={{
        background: lang === code ? 'var(--accent)' : 'transparent',
        color: lang === code ? '#fff' : 'var(--text-dim)',
        border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
        fontSize: 13, fontWeight: 600,
      }}
    >
      {label}
    </button>
  )

  return (
    <div className="site-header">
      <div className="site-header-inner">
        <div className="logos">
          {/* Podmień placeholdery na właściwe pliki w public/:
              <img src="/logo-pw.svg" alt="Politechnika Warszawska" className="logo-img" /> */}
          <div className="logo-ph">LOGO<br />PW</div>
          <div className="logo-ph small">LOGO<br />{t.netLabel}</div>
        </div>
        <div className="header-right">
          <div className="header-titles">
            <div className="header-title">{t.headerTitle}</div>
            <div className="header-sub">{t.headerSub}</div>
          </div>
          <div className="lang-switch">
            {langBtn('pl', 'PL')}
            {langBtn('en', 'EN')}
          </div>
        </div>
      </div>
    </div>
  )
}
