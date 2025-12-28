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
    <title>Jak sie dzis czuje pupik</title>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

    <style>
      /* --- STYLE OGÓLNE --- */
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #050505; /* Prawie czarne tło */
        overflow: hidden;
        font-family: 'Courier New', Courier, monospace; /* Bardziej surowa czcionka */
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
        font-weight: normal;
        text-transform: uppercase;
        letter-spacing: 4px;
        margin-bottom: 50px;
        font-size: 14px;
        opacity: 0.5;
      }
      
      .mood-buttons { 
        display: flex; 
        flex-direction: row; 
        gap: 40px; 
        justify-content: center; 
        flex-wrap: wrap;
      }
      
      /* --- MINIMALISTYCZNE CZARNE PRZYCISKI --- */
      .btn { 
        width: 100px;
        height: 100px;
        
        /* Kwadratowe, czarne, bez obramowania */
        border-radius: 0; 
        background: #000000;
        border: none;
        
        cursor: pointer; 
        color: white; 
        font-weight: bold;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
        position: relative; 
        transition: transform 0.1s;
        
        /* Delikatny cień, żeby odróżnić czarny przycisk od czarnego tła */
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
        
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      .btn:active { transform: scale(0.98); background: #111; }
      
      /* Usunięto kolory - wszystko czarne */
      .btn-hepi, .btn-normal, .btn-sad {
          /* Ewentualnie bardzo subtelny border na dole, jeśli chcesz */
          /* border-bottom: 2px solid #333; */
      }

      #status { font-size: 10px; color: #444; margin-top: 40px; display: block; font-family: monospace;}
    </style>
  </head>
  <body>

    <canvas></canvas>

    <div class="ui-layer">
      <div class="container">
        <h1>jak sie dzis czujemy pupiku</h1>
        
        <div class="mood-buttons">
          <button class="btn btn-hepi" id="btnHepi" onclick="setGlobalAngle(0)">
            hepi
          </button>
          
          <button class="btn btn-normal" id="btnNormal" onclick="setGlobalAngle(270)">
             normal
          </button>
          
          <button class="btn btn-sad" id="btnSad" onclick="setGlobalAngle(1080)">
             smuticzek
          </button>
        </div>
        
        <small id="status">System Ready</small>
      </div>
    </div>

    <script>
      function setGlobalAngle(angle) {
        const status = document.getElementById('status');
        status.innerText = "SENDING >> " + angle;
        fetch(\`/setAll?angle=\${angle}\`)
          .then(() => {
             status.innerText = "ACKNOWLEDGED";
             status.style.color = "#fff";
             setTimeout(() => { status.innerText = "STANDBY"; status.style.color = "#444"; }, 2000);
          })
          .catch(() => status.innerText = "CONNECTION ERROR");
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

          // 2000 płatków w buforze
          for (let i = 0; i < 2000; i++) makeFlake(i);

          function makeFlake(i) {
              const startX = Math.random() * (cw + 800) - 600; 
              
              arr[i] = { 
                  x: startX, 
                  y: -20, // Start nad ekranem
                  s: Math.random() * 1.5 + 0.5, 
                  stopped: false 
              };

              arr[i].t = gsap.to(arr[i], {
                  y: ch + 20, 
                  x: '+=' + (200 + gsap.utils.random(-50, 50)), 
                  ease: "none",
                  duration: gsap.utils.random(15, 25), 
                  repeat: -1,
                  
                  // --- BRAK ŚNIEGU NA STARCIE ---
                  // Opóźnienie dodatnie (0 do 30 sekund). 
                  // Płatki zaczną spadać pojedynczo dopiero po załadowaniu.
                  delay: Math.random() * 30, 
                  
                  onUpdate: function() {
                      checkCollision(arr[i], this);
                  }
              });
          }

          function checkCollision(flake, tween) {
              if (flake.stopped) return;

              const rects = obstacles();
              
              for (let r of rects) {
                  const hitMargin = 5;

                  // 1. GÓRA
                  if (flake.x > r.left && flake.x < r.right) {
                      if (Math.abs(flake.y - r.top) < hitMargin) {
                          let pileHeight = Math.random() * 3;
                          freezeFlake(flake, tween, flake.x, r.top - flake.s/2 - pileHeight);
                          return;
                      }
                  }

                  // 2. LEWY BOK
                  if (flake.y > r.top && flake.y < r.bottom) {
                      if (Math.abs(flake.x - r.left) < hitMargin) {
                          freezeFlake(flake, tween, r.left - flake.s/2, flake.y);
                          return;
                      }
                  }
              }
          }

          function freezeFlake(flake, tween, stickX, stickY) {
              tween.pause();
              flake.stopped = true;
              flake.x = stickX;
              flake.y = stickY;

              // Recykling: Płatek leży 20-40s, potem wraca na górę
              gsap.delayedCall(gsap.utils.random(20, 40), () => {
                  flake.stopped = false;
                  flake.y = -20;
                  flake.x = Math.random() * (cw + 800) - 600;
                  tween.play(0); 
              });
          }

          ctx.fillStyle = '#ffffff'; 

          gsap.ticker.add(() => {
              ctx.clearRect(0, 0, cw, ch);
              arr.forEach(f => {
                  // Rysuj tylko jeśli płatek "wystartował" (minął delay)
                  // GSAP zarządza pozycją, ale my sprawdzamy czy y > -50 żeby nie rysować niewidocznych
                  if (f.y > -50) {
                      ctx.globalAlpha = f.opacity || 0.9; 
                      ctx.beginPath();
                      ctx.arc(f.x, f.y, f.s, 0, Math.PI * 2);
                      ctx.fill();
                  }
              });
          });
      });
    </script>
  </body>
  </html>`);
});

// Endpointy
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
