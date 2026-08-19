import React from 'react'

export default function Header({ t }) {
  return (
    <div className="site-header">
      <div className="site-header-inner">
        <div className="logos">
          <img src="/WUT-logo.jpeg"   alt="Warsaw University of Technology" className="logo-img" /> 
          <img src="/sbrp-logo.jpeg" alt="Research Network"               className="logo-img" />
        </div>
        <div className="header-right">
          <div className="header-titles">
            <div className="header-title">{t.headerTitle}</div>
            <div className="header-sub">{t.headerSub}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
