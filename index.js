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
      /* --- STYLE OGÓLNE I TŁO --- */
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #000; /* Czarne tło dla śniegu */
        overflow: hidden;
        font-family: sans-serif;
      }

      /* Tło ze śniegiem (pod spodem) */
      .fixed-bg {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 100vw;
        height: 100vh;
        z-index: 1; /* Niska warstwa */
        pointer-events: none; /* Żeby kliknięcia przelatywały do przycisków */
      }

      canvas {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        aspect-ratio: 1;
        width: 100%;
        height: auto;
      }

      /* Ukryty obrazek bazowy dla śniegu */
      .text-img { display: none; }

      /* --- PANEL STEROWANIA (NA WIERZCHU) --- */
      .ui-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 100; /* Musi być wyżej niż canvas! */
        display: flex;
        flex-direction: column;
        justify-content: flex-end; /* Przyciski na dole, żeby nie zasłaniały napisu ze śniegu */
        align-items: center;
        padding-bottom: 50px;
        pointer-events: none; /* Tylko przyciski mają być aktywne */
      }

      .container { 
        pointer-events: auto; /* Włączamy klikanie w panel */
        background: rgba(255, 255, 255, 0.1); /* Półprzezroczyste tło */
        backdrop-filter: blur(5px); /* Rozmycie tła */
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 20px; 
        padding: 20px; 
        max-width: 400px; 
        width: 90%;
        text-align: center;
        color: white;
      }
      
      h1 { 
        color: #fff; 
        text-shadow: 0 0 10px rgba(255,255,255,0.5);
        margin-top: 0;
        font-size: 1.2rem;
      }
      
      .mood-buttons { display: flex; flex-direction: row; gap: 10px; justify-content: center; margin-top: 15px; }
      
      .btn { 
        flex: 1;
        padding: 15px 10px; 
        font-size: 16px; 
        border: none; 
        border-radius: 12px; 
        cursor: pointer; 
        transition: transform 0.2s, filter 0.2s;
        color: white; 
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .btn:active { transform: scale(0.95); }
      .btn:hover { filter: brightness(1.2); }

      .btn-hepi { background: linear-gradient(135deg, #4CAF50, #8BC34A); box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4); }
      .btn-normal { background: linear-gradient(135deg, #2196F3, #03A9F4); box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4); }
      .btn-sad { background: linear-gradient(135deg, #607D8B, #90A4AE); box-shadow: 0 4px 15px rgba(96, 125, 139, 0.4); }

      #status { font-size: 10px; color: #aaa; margin-top: 10px; display: block;}

      @media (max-aspect-ratio: 1) {
        canvas { width: auto; height: 100%; }
      }
    </style>
  </head>
  <body>

    <div class="fixed-bg">
       <canvas></canvas>
    </div>

    <img class="text-img" src="data:image/png;base64,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" />

    <div class="ui-layer">
      <div class="container">
        <h1>🌹 Sterowanie Nastrojem</h1>
        
        <div class="mood-buttons">
          
          <button class="btn btn-hepi" onclick="setGlobalAngle(0)">
            😊<br>Hepi
          </button>

          <button class="btn btn-normal" onclick="setGlobalAngle(540)">
            😐<br>Normal
          </button>

          <button class="btn btn-sad" onclick="setGlobalAngle(1080)">
            😢<br>Smutek
          </button>

        </div>
        
        <small id="status">Połączono</small>
      </div>
    </div>

    <script>
      // 1. STEROWANIE SERWAMI
      function setGlobalAngle(angle) {
        const status = document.getElementById('status');
        status.innerText = "Wysyłam: " + angle + "...";
        status.style.color = "#fff";
        
        fetch(\`/setAll?angle=\${angle}\`)
          .then(() => {
             status.innerText = "Wysłano pomyślnie!";
             status.style.color = "#4CAF50";
             setTimeout(() => status.innerText = "Gotowy", 2000);
          })
          .catch(() => {
             status.innerText = "Błąd połączenia!";
             status.style.color = "#f44336";
          });
      }

      // 2. EFEKT ŚNIEGU (Twoja logika)
      window.addEventListener('load', () => {
          const arr = [];
          const c = document.querySelector('canvas');
          const ctx = c.getContext('2d');
          const cw = (c.width = 3000);
          const ch = (c.height = 3000);
          const c2 = c.cloneNode(true);
          const ctx2 = c2.getContext('2d', { willReadFrequently: true });
          const txtImg = document.querySelector('.text-img');

          const drawImageOnHiddenCanvas = () => {
              // Rysujemy napis na ukrytym canvasie
              ctx2.drawImage(txtImg, 560, 1380);
          };

          if (txtImg.complete) drawImageOnHiddenCanvas();
          else txtImg.onload = drawImageOnHiddenCanvas;

          for (let i = 0; i < 1300; i++) makeFlake(i, true);

          function makeFlake(i, ff) {
              arr.push({ i: i, x: 0, x2: 0, y: 0, s: 0 });
              arr[i].t = gsap.timeline({ repeat: -1, repeatRefresh: true })
                  .fromTo(
                      arr[i],
                      {
                          x: () => -400 + (cw + 800) * Math.random(),
                          y: -15,
                          s: () => gsap.utils.random(1.8, 7, 0.1),
                          x2: -500,
                      },
                      {
                          ease: 'none',
                          y: ch,
                          x: '+=' + gsap.utils.random(-400, 400, 1),
                          x2: 500,
                          duration: gsap.utils.random(3, 8)
                      }
                  )
                  .seek(ff ? Math.random() * 5 : 0)
                  .timeScale(arr[i].s / 37);
          }

          ctx.fillStyle = '#fff';
          gsap.ticker.add(render);

          function render() {
              ctx.clearRect(0, 0, cw, ch);
              arr.forEach(c => {
                  if (c.t) {
                      if (c.t.isActive()) {
                          const d = ctx2.getImageData(Math.floor(c.x + c.x2), Math.floor(c.y), 1, 1);
                          if (d.data[3] > 150 && Math.random() > 0.5) {
                              c.t.pause();
                              if (arr.length < 9000) makeFlake(arr.length - 1, false);
                          }
                      }
                  }
                  ctx.beginPath();
                  ctx.arc(
                      c.x + c.x2,
                      c.y,
                      c.s * gsap.utils.interpolate(1, 0.2, c.y / ch),
                      0,
                      Math.PI * 2
                  );
                  ctx.fill();
              });
          }
      });
    </script>
  </body>
  </html>`);
});

// Endpointy API (bez zmian)
app.get("/setAll", (req, res) => {
  const { angle } = req.query;
  const newAngle = parseInt(angle);
  if (!isNaN(newAngle)) {
    for (const esp in states) {
      states[esp].targetAngle = newAngle;
      states[esp].id++;
    }
    console.log(`Nowy nastrój (kąt): ${newAngle}`);
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
