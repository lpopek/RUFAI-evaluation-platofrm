# Gdzie wgrac logo

1. Wrzuc pliki logo do tego folderu (public/), np.:
     public/logo-pw.svg     (lub .png)   — logo uczelni
     public/logo-siec.svg   (lub .png)   — logo sieci badawczej

2. W src/components/Header.jsx odkomentuj linie <img ...> i usun
   placeholdery <div className="logo-ph">...</div>:

     <img src="/logo-pw.svg"   alt="Warsaw University of Technology" className="logo-img" />
     <img src="/logo-siec.svg" alt="Research Network"               className="logo-img" />

   Pliki w public/ sa serwowane z korzenia, wiec sciezka to "/logo-pw.svg"
   (bez "public/").

3. Styl .logo-img (wysokosc 56px) jest juz w src/styles.css — logo dopasuje
   sie automatycznie. Jesli chcesz inna wysokosc, zmien .logo-img w styles.css.
