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
    <title>Sterowanie 2160° 🌹</title>
    <style>
      body { text-align:center; font-family:sans-serif; background-color: #f4f4f4; padding: 20px; }
      .container { background: white; border: 1px solid #ddd; border-radius: 15px; padding: 20px; margin: 10px auto; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      input[type=number] { padding: 12px; font-size: 20px; width: 60%; text-align: center; border-radius: 5px; border: 1px solid #ccc; }
      .send-btn { padding: 12px 20px; font-size: 20px; background-color: #6610f2; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 5px; }
      .presets { display: flex; flex-wrap: wrap; justify-content: space-around; }
      .presets button { padding: 10px; margin: 5px; width: 40%; cursor:pointer; background: #e2e6ea; border: 1px solid #ced4da; border-radius: 5px; font-weight: bold; }
      .presets button:active { background: #dae0e5; }
    </style>
  </head>
  <body>
    <h1>🌹 Sterowanie 6 Obrotów</h1>
    
    <div class="container">
      <h2>Podaj Kąt (0 - 2160)</h2>
      <div>
        <input type="number" id="angleInput" placeholder="0">
        <button class="send-btn" onclick="sendCustomAngle()">Jedź</button>
      </div>
      <p><small>Zakres obejmuje 6 pełnych obrotów (jeśli serwo na to pozwala).</small></p>
    </div>

    <div class="container">
      <h3>Szybki Wybór</h3>
      <div class="presets">
        <button onclick="setGlobalAngle(0)">0° (Start)</button>
        <button onclick="setGlobalAngle(360)">360° (1 Obrót)</button>
        <button onclick="setGlobalAngle(720)">720° (2 Obroty)</button>
        <button onclick="setGlobalAngle(1080)">1080° (3 Obroty)</button>
        <button onclick="setGlobalAngle(1440)">1440° (4 Obroty)</button>
        <button onclick="setGlobalAngle(2160)">2160° (MAX)</button>
      </div>
    </div>

    <script>
      function setGlobalAngle(angle) {
        fetch(\`/setAll?angle=\${angle}\`);
      }
      function sendCustomAngle() {
        const val = document.getElementById('angleInput').value;
        if(val !== "") setGlobalAngle(val);
      }
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
    console.log(`Nowy cel: ${newAngle}`);
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
