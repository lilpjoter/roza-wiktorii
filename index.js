const express = require("express");
const app = express();

// Przechowujemy cel i ID
let states = {
  esp1: { targetAngle: 0, id: 0 },
  esp2: { targetAngle: 0, id: 0 }
};

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
    <title>Sterowanie Nastrojem 🌹</title>
    <style>
      body { text-align:center; font-family:sans-serif; background-color: #fce4ec; padding: 20px; }
      .container { background: white; border: 2px solid #f8bbd0; border-radius: 20px; padding: 20px; margin: 10px auto; max-width: 400px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
      
      h1 { color: #880e4f; }
      
      /* Style dla przycisków emocji */
      .mood-buttons { display: flex; flex-direction: column; gap: 15px; margin-top: 20px; }
      
      .btn { 
        padding: 20px; 
        font-size: 24px; 
        border: none; 
        border-radius: 15px; 
        cursor: pointer; 
        transition: transform 0.2s;
        color: white; 
        font-weight: bold;
        box-shadow: 0 4px 6px rgba(0,0,0,0.2);
      }

      .btn:active { transform: scale(0.95); }

      /* Kolory przycisków */
      .btn-hepi { background-color: #4CAF50; } /* Zielony */
      .btn-normal { background-color: #2196F3; } /* Niebieski */
      .btn-sad { background-color: #607D8B; }   /* Szary/Smutny */

      /* Ukryta sekcja debugowania (dla Ciebie) */
      .debug { margin-top: 30px; font-size: 12px; color: #aaa; }
    </style>
  </head>
  <body>
    <h1>🌹 Jak się czuje Róża?</h1>
    
    <div class="container">
      <div class="mood-buttons">
        
        <button class="btn btn-hepi" onclick="setGlobalAngle(0)">
          😊 Hepi
        </button>

        <button class="btn btn-normal" onclick="setGlobalAngle(540)">
          😐 Normal
        </button>

        <button class="btn btn-sad" onclick="setGlobalAngle(1080)">
          😢 Smuticzek
        </button>

      </div>
      
      <div class="debug">
        <p>Debug: <span id="status">Czekam...</span></p>
      </div>
    </div>

    <script>
      function setGlobalAngle(angle) {
        document.getElementById('status').innerText = "Wysyłam: " + angle;
        fetch(\`/setAll?angle=\${angle}\`)
          .then(() => document.getElementById('status').innerText = "Wysłano: " + angle)
          .catch(() => document.getElementById('status').innerText = "Błąd połączenia!");
      }
    </script>
  </body>
  </html>`);
});

// Reszta kodu bez zmian...
app.get("/setAll", (req, res) => {
  const { angle } = req.query;
  const newAngle = parseInt(angle);
  if (!isNaN(newAngle)) {
    for (const esp in states) {
      states[esp].targetAngle = newAngle;
      states[esp].id++;
    }
    console.log(`Nowy nastrój: ${newAngle}`);
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
