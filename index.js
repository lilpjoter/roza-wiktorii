const express = require("express");
const app = express();

// --- BAZA DANYCH STANU ---
let states = {
  esp1: { targetAngle: 0, id: 0 },
  esp2: { targetAngle: 0, id: 0 }
};

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html lang="pl">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Snowy Mood Control ❄️🌹</title>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

    <style>
      /* --- STYLE OGÓLNE --- */
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #0d0d0d; /* Ciemne tło, żeby śnieg był widoczny */
        overflow: hidden;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      /* Płótno śniegu na samym wierzchu, ale "przezroczyste" dla kliknięć */
      canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 50; /* Śnieg nad przyciskami */
        pointer-events: none; /* KLUCZOWE: Pozwala klikać w przyciski pod śniegiem */
      }

      /* --- PANEL STEROWANIA --- */
      .ui-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .container { 
        background: rgba(20, 20, 20, 0.6); /* Ciemne półprzezroczyste */
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 20px; 
        padding: 30px; 
        max-width: 400px; 
        width: 90%;
        text-align: center;
        color: white;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        /* Ważne dla osiadania śniegu: */
        position: relative; 
      }
      
      h1 { 
        margin-top: 0;
        font-weight: 300;
        letter-spacing: 2px;
        margin-bottom: 20px;
      }
      
      .mood-buttons { 
        display: flex; 
        flex-direction: column; /* Pionowo na mobilkach łatwiej */
        gap: 15px; 
        justify-content: center; 
      }
      
      .btn { 
        padding: 15px; 
        font-size: 18px; 
        border: none; 
        border-radius: 12px; 
        cursor: pointer; 
        color: white; 
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
        position: relative; /* Dla obliczeń pozycji */
        transition: transform 0.1s;
      }

      .btn:active { transform: scale(0.98); }

      /* Kolory przycisków */
      .btn-hepi { background: linear-gradient(90deg, #4CAF50, #8BC34A); }
      .btn-normal { background: linear-gradient(90deg, #2196F3, #03A9F4); }
      .btn-sad { background: linear-gradient(90deg, #607D8B, #78909C); }

      #status { font-size: 12px; color: #888; margin-top: 15px; display: block;}
    </style>
  </head>
  <body>

    <canvas></canvas>

    <div class="ui-layer">
      <div class="container" id="mainCard">
        <h1>Sterowanie Nastrojem</h1>
        
        <div class="mood-buttons">
          <button class="btn btn-hepi" id="btnHepi" onclick="setGlobalAngle(0)">hepi</button>
          <button class="btn btn-normal" id="btnNormal" onclick="setGlobalAngle(540)">normal pups</button>
          <button class="btn btn-sad" id="btnSad" onclick="setGlobalAngle(1080)">smuticzek</button>
        </div>
        
        <small id="status">Gotowy do działania</small>
      </div>
    </div>

    <script>
      // --- 1. KOMUNIKACJA Z SERWEREM ---
      function setGlobalAngle(angle) {
        const status = document.getElementById('status');
        status.innerText = "Wysyłam...";
        
        fetch(\`/setAll?angle=\${angle}\`)
          .then(() => {
             status.innerText = "Wysłano pomyślnie!";
             status.style.color = "#4CAF50";
             setTimeout(() => { status.innerText = "Gotowy"; status.style.color = "#888"; }, 2000);
          })
          .catch(() => {
             status.innerText = "Błąd połączenia!";
             status.style.color = "#f44336";
          });
      }

      // --- 2. ZAAWANSOWANY EFEKT ŚNIEGU ---
      window.addEventListener('load', () => {
          const arr = [];
          const c = document.querySelector('canvas');
          const ctx = c.getContext('2d');
          
          let cw = window.innerWidth;
          let ch = window.innerHeight;
          c.width = cw;
          c.height = ch;

          // Aktualizacja rozmiaru przy zmianie okna
          window.addEventListener('resize', () => {
              cw = window.innerWidth;
              ch = window.innerHeight;
              c.width = cw;
              c.height = ch;
          });

          // Pobieramy elementy, na których ma osiadać śnieg
          // Dodajemy 'container' (kafelek) i wszystkie przyciski '.btn'
          const obstacles = () => {
             return [
                 document.getElementById('mainCard').getBoundingClientRect(),
                 document.getElementById('btnHepi').getBoundingClientRect(),
                 document.getElementById('btnNormal').getBoundingClientRect(),
                 document.getElementById('btnSad').getBoundingClientRect()
             ];
          };

          // Generowanie 600 płatków (możesz zwiększyć)
          for (let i = 0; i < 600; i++) makeFlake(i, true);

          function makeFlake(i, fastForward) {
              arr[i] = { 
                  x: Math.random() * cw, 
                  y: -20, 
                  s: Math.random() * 3 + 1, // Rozmiar
                  stopped: false 
              };

              // ANIMACJA GSAP
              // Przyspieszona o 20% (duration zmniejszone z 3-8 na 2.4-6.4)
              arr[i].t = gsap.to(arr[i], {
                  y: ch + 20, // Cel: dół ekranu
                  x: '+=' + gsap.utils.random(-100, 100), // Lekki wiatr
                  ease: "none",
                  duration: gsap.utils.random(2.4, 6.4), // SZYBSZE SPADANIE
                  repeat: -1,
                  delay: fastForward ? -Math.random() * 5 : 0, // Losowy start
                  onUpdate: function() {
                      // Tutaj sprawdzamy kolizję w każdej klatce
                      checkCollision(arr[i], this);
                  }
              });
          }

          function checkCollision(flake, tween) {
              if (flake.stopped) return;

              const rects = obstacles(); // Pobierz aktualne pozycje przycisków
              
              for (let r of rects) {
                  // Sprawdź czy płatek jest w poziomie elementu
                  if (flake.x > r.left && flake.x < r.right) {
                      // Sprawdź czy płatek dotyka górnej krawędzi (z tolerancją 5px)
                      if (Math.abs(flake.y - r.top) < 5) {
                          // EFEKT PRZYKLEJENIA
                          tween.pause(); // Zatrzymaj animację GSAP
                          flake.stopped = true;
                          flake.y = r.top - flake.s/2; // Ustaw idealnie na krawędzi
                          
                          // Topniej po czasie (opcjonalnie - żeby nie zakryło wszystkiego)
                          // Jeśli chcesz, żeby zostało na zawsze, usuń te 3 linijki poniżej:
                          gsap.to(flake, { opacity: 0, duration: 2, delay: 3, onComplete: () => {
                             // Restart płatka po roztopieniu
                             flake.stopped = false;
                             flake.opacity = 1;
                             flake.y = -20;
                             flake.x = Math.random() * cw;
                             tween.play(0);
                          }});
                          
                          // Jeśli płatek się zatrzymał, nie sprawdzaj innych przeszkód
                          return;
                      }
                  }
              }
          }

          ctx.fillStyle = '#fff';
          
          // Pętla rysowania
          gsap.ticker.add(() => {
              ctx.clearRect(0, 0, cw, ch);
              
              arr.forEach(f => {
                  ctx.globalAlpha = f.opacity || 1;
                  ctx.beginPath();
                  ctx.arc(f.x, f.y, f.s, 0, Math.PI * 2);
                  ctx.fill();
              });
          });
      });
    </script>
  </body>
  </html>`);
});

// Endpointy (bez zmian)
app.get("/setAll", (req, res) => {
  const { angle } = req.query;
  const newAngle = parseInt(angle);
  if (!isNaN(newAngle)) {
    for (const esp in states) {
      states[esp].targetAngle = newAngle;
      states[esp].id++;
    }
    res.send("OK");
  } else {
    res.status(400).send("Error");
  }
});

app.get("/state", (req, res) => {
  const { esp } = req.query;
  if (states[esp]) res.send(`${states[esp].targetAngle},${states[esp].id}`);
  else res.status(404).send("Unknown ESP");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serwer działa na porcie " + PORT));
