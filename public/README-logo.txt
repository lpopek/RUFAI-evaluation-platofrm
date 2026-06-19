Umieść tutaj pliki logo i podmień placeholdery w src/components/Header.jsx:

  /logo-pw.svg    — logo Politechniki Warszawskiej
  /logo-siec.svg  — logo sieci badawczej

W Header.jsx zamień <div className="logo-ph">…</div> na:
  <img src="/logo-pw.svg"   alt="Politechnika Warszawska" className="logo-img" />
  <img src="/logo-siec.svg" alt="Sieć Badawcza"          className="logo-img" />
