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
        background: #050505;
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

      .container { 
        max-width: 600px;
        width: 95%;
        text-align: center;
        position: relative; 
      }
      
      h1 { 
        color: #fff;
        font-weight: 300;
        letter-spacing: 2px;
        margin-bottom: 40px;
        text-shadow: 0 0 10px rgba(255,255,255,0.2);
      }
      
      .mood-buttons { 
        display: flex; 
        flex-direction: row; 
        gap: 40px; 
        justify-content: center; 
        flex-wrap: wrap;
      }
      
      .btn { 
        width: 100px;
        height: 100px;
        border-radius: 12px; 
        border: none;
        cursor: pointer; 
        color: white; 
        font-weight: bold;
        font-size: 16px;
        position: relative; 
        transition: transform 0.1s;
        box-shadow: 0 10px 25px rgba(0,0,0,1);
        
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        
        backdrop-filter: blur(4px);
      }

      .btn:active { transform: scale(0.95); }

      /* Kolory przycisków */
      .btn-hepi { background: linear-gradient(135deg, #2e7d32, #1b5e20); border: 1px solid #4caf50; }
      .btn-normal { background: linear-gradient(135deg, #1565c0, #0d47a1); border: 1px solid #2196f3; }
      .btn-sad { background: linear-gradient(135deg, #37474f, #263238); border: 1px solid #546e7a; }

      .emoji { font-size: 32px; margin-bottom: 8px; display: block; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.5)); }

      #status { font-size: 12px; color: #666; margin-top: 30px; display: block;}
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
             setTimeout(() => { status.innerText = "Gotowy"; status.style.color = "#666"; }, 2000);
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

          const obstacles = () => {
             return [
                 document.getElementById('btnHepi').getBoundingClientRect(),
                 document.getElementById('btnNormal').getBoundingClientRect(),
                 document.getElementById('btnSad').getBoundingClientRect()
             ];
          };

          // --- ZWIĘKSZONA ILOŚĆ PŁATKÓW (1500) ---
          // Ponieważ te co spadną już nie wracają, musimy mieć ich dużo w zapasie
          for (let i = 0; i < 1500; i++) makeFlake(i, true);

          function makeFlake(i, fastForward) {
              const startX = Math.random() * (cw + 200) - 200; 
              
              arr[i] = { 
                  x: startX, 
                  y: -20, 
                  // --- ZNACZNIE MNIEJSZY ROZMIAR ---
                  // Zakres od 0.5px do 2.0px
                  s: Math.random() * 1.5 + 0.5, 
                  stopped: false 
              };

              arr[i].t = gsap.to(arr[i], {
                  y: ch + 20, 
                  x: '+=' + (200 + gsap.utils.random(-50, 50)), 
                  ease: "none",
                  duration: gsap.utils.random(3, 8), 
                  repeat: -1,
                  delay: fastForward ? -Math.random() * 8 : 0,
                  onUpdate: function() {
                      checkCollision(arr[i], this);
                  }
              });
          }

          function checkCollision(flake, tween) {
              if (flake.stopped) return;

              const rects = obstacles();
              
              for (let r of rects) {
                  const hitMargin = 4; // Mniejszy margines dla małych płatków

                  // 1. KOLIZJA Z GÓRĄ (TOP)
                  if (flake.x > r.left && flake.x < r.right) {
                      if (Math.abs(flake.y - r.top) < hitMargin) {
                          freezeFlake(flake, tween, flake.x, r.top - flake.s/2);
                          return;
                      }
                  }

                  // 2. KOLIZJA Z BOKIEM (LEWA STRONA)
                  if (flake.y > r.top && flake.y < r.bottom) {
                      if (Math.abs(flake.x - r.left) < hitMargin) {
                          freezeFlake(flake, tween, r.left - flake.s/2, flake.y);
                          return;
                      }
                  }
              }
          }

          function freezeFlake(flake, tween, stickX, stickY) {
              // Zatrzymaj animację
              tween.pause();
              
              // Oznacz jako zatrzymany
              flake.stopped = true;
              
              // Przyklej w miejscu zderzenia
              flake.x = stickX;
              flake.y = stickY;

              // --- USUNIĘTO TOPNIENIE ---
              // Płatek zostaje tu na zawsze.
              // Nie ma kodu gsap.to(opacity: 0)...
          }

          ctx.fillStyle = '#ffffff'; 

          gsap.ticker.add(() => {
              ctx.clearRect(0, 0, cw, ch);
              arr.forEach(f => {
                  // Rysujemy wszystkie (te co lecą i te co leżą)
                  ctx.globalAlpha = f.opacity || 0.9; 
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
