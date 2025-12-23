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
      /* --- CIEMNIEJSZE TŁO --- */
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #000000; /* Absolutna czerń */
        overflow: hidden;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 50; 
        pointer-events: none; 
      }

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

      /* Usunąłem tło kontenera, żeby przyciski były "osobnymi bytami" */
      .container { 
        max-width: 600px; /* Szerszy kontener na układ poziomy */
        width: 95%;
        text-align: center;
        position: relative; 
      }
      
      h1 { 
        color: #ddd;
        font-weight: 300;
        letter-spacing: 2px;
        margin-bottom: 40px;
        text-shadow: 0 0 10px rgba(255,255,255,0.1);
      }
      
      /* --- UKŁAD RÓWNOLEGŁY (POZIOMY) --- */
      .mood-buttons { 
        display: flex; 
        flex-direction: row; /* W poziomie */
        gap: 30px; /* Odstęp między "wyspami" */
        justify-content: center; 
        flex-wrap: wrap; /* Żeby na małym telefonie się zmieściły */
      }
      
      .btn { 
        /* Każdy przycisk to osobny, duży blok */
        width: 100px;
        height: 100px;
        border-radius: 15px; 
        border: none;
        cursor: pointer; 
        color: white; 
        font-weight: bold;
        font-size: 16px;
        position: relative; 
        transition: transform 0.1s;
        
        /* Cień żeby wyglądały na przestrzenne */
        box-shadow: 0 10px 20px rgba(0,0,0,0.8);
        
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      .btn:active { transform: scale(0.95); }

      /* Kolory przycisków - trochę ciemniejsze */
      .btn-hepi { background: linear-gradient(135deg, #2e7d32, #1b5e20); border: 1px solid #4caf50; }
      .btn-normal { background: linear-gradient(135deg, #1565c0, #0d47a1); border: 1px solid #2196f3; }
      .btn-sad { background: linear-gradient(135deg, #455a64, #263238); border: 1px solid #607d8b; }

      .emoji { font-size: 30px; margin-bottom: 5px; display: block; }

      #status { font-size: 12px; color: #555; margin-top: 30px; display: block;}
    </style>
  </head>
  <body>

    <canvas></canvas>

    <div class="ui-layer">
      <div class="container">
        <h1>Sterowanie Nastrojem</h1>
        
        <div class="mood-buttons">
          <button class="btn btn-hepi" id="btnHepi" onclick="setGlobalAngle(0)">
            <span class="emoji">😊</span>Hepi
          </button>
          
          <button class="btn btn-normal" id="btnNormal" onclick="setGlobalAngle(540)">
             <span class="emoji">😐</span>Normal
          </button>
          
          <button class="btn btn-sad" id="btnSad" onclick="setGlobalAngle(1080)">
             <span class="emoji">😢</span>Smutek
          </button>
        </div>
        
        <small id="status">Gotowy</small>
      </div>
    </div>

    <script>
      function setGlobalAngle(angle) {
        const status = document.getElementById('status');
        status.innerText = "Wysyłam...";
        fetch(\`/setAll?angle=\${angle}\`)
          .then(() => {
             status.innerText = "OK";
             status.style.color = "#4CAF50";
             setTimeout(() => { status.innerText = "Gotowy"; status.style.color = "#555"; }, 2000);
          })
          .catch(() => status.innerText = "Błąd!");
      }

      window.addEventListener('load', () => {
          const arr = [];
          const c = document.querySelector('canvas');
          const ctx = c.getContext('2d');
          
          let cw = window.innerWidth;
          let ch = window.innerHeight;
          c.width = cw;
          c.height = ch;

          window.addEventListener('resize', () => {
              cw = window.innerWidth;
              ch = window.innerHeight;
              c.width = cw;
              c.height = ch;
          });

          // --- OSOBNE BYTY ---
          // Zwracamy tylko przyciski, bez kontenera.
          // Śnieg spadnie między nimi.
          const obstacles = () => {
             return [
                 document.getElementById('btnHepi').getBoundingClientRect(),
                 document.getElementById('btnNormal').getBoundingClientRect(),
                 document.getElementById('btnSad').getBoundingClientRect()
             ];
          };

          for (let i = 0; i < 800; i++) makeFlake(i, true);

          function makeFlake(i, fastForward) {
              arr[i] = { 
                  x: Math.random() * cw, 
                  y: -20, 
                  s: Math.random() * 3 + 1, 
                  stopped: false 
              };

              arr[i].t = gsap.to(arr[i], {
                  y: ch + 20, 
                  x: '+=' + gsap.utils.random(-100, 100),
                  ease: "none",
                  // Przyspieszone o 20%
                  duration: gsap.utils.random(2.4, 6.4), 
                  repeat: -1,
                  delay: fastForward ? -Math.random() * 5 : 0,
                  onUpdate: function() {
                      checkCollision(arr[i], this);
                  }
              });
          }

          function checkCollision(flake, tween) {
              if (flake.stopped) return;

              const rects = obstacles();
              
              for (let r of rects) {
                  // Sprawdzamy czy płatek jest nad KONKRETNYM bloczkiem
                  if (flake.x > r.left && flake.x < r.right) {
                      if (Math.abs(flake.y - r.top) < 5) {
                          tween.pause();
                          flake.stopped = true;
                          flake.y = r.top - flake.s/2; 
                          
                          // Topnienie (opcjonalne)
                          gsap.to(flake, { opacity: 0, duration: 2, delay: 4, onComplete: () => {
                             flake.stopped = false;
                             flake.opacity = 1;
                             flake.y = -20;
                             flake.x = Math.random() * cw;
                             tween.play(0);
                          }});
                          return;
                      }
                  }
              }
          }

          // --- CIEMNIEJSZY ŚNIEG ---
          // Zamiast '#fff' dajemy szary
          ctx.fillStyle = '#8899aa'; 

          gsap.ticker.add(() => {
              ctx.clearRect(0, 0, cw, ch);
              arr.forEach(f => {
                  ctx.globalAlpha = f.opacity || 0.8; // Lekka przezroczystość
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
