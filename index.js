const express = require("express");
const app = express();

// Przechowujemy kąt (0-360) i ID zmiany
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
    <title>Sterowanie 360 🌹</title>
    <style>
      body { text-align:center; font-family:sans-serif; background-color: #f4f4f4; }
      .container { background: white; border: 1px solid #ddd; border-radius: 15px; padding: 20px; margin: 20px auto; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      input[type=number] { padding: 10px; font-size: 18px; width: 60%; text-align: center; }
      .send-btn { padding: 10px 20px; font-size: 18px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
      .presets button { margin: 5px; padding: 10px; width: 30%; cursor:pointer; }
    </style>
  </head>
  <body>
    <h1>🌹 Sterowanie 360°</h1>

    <div class="container">
      <h2>Ustaw Kąt (0-360°)</h2>
      <div>
        <input type="number" id="angleInput" placeholder="Np. 180" min="0" max="360">
        <button class="send-btn" onclick="sendCustomAngle()">Wyślij</button>
      </div>
    </div>

    <div class="container presets">
      <h3>Szybki wybór</h3>
      <button onclick="setGlobalAngle(0)">0°</button>
      <button onclick="setGlobalAngle(90)">90°</button>
      <button onclick="setGlobalAngle(180)">180°</button>
      <button onclick="setGlobalAngle(270)">270°</button>
      <button onclick="setGlobalAngle(360)">360°</button>
    </div>

    <script>
      function setGlobalAngle(angle) {
        fetch(\`/setAll?angle=\${angle}\`).then(() => console.log('Wysłano:', angle));
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
    console.log(`Globalny rozkaz: ${newAngle}°`);
    res.send("OK");
  } else {
    res.status(400).send("Bad Value");
  }
});

app.get("/state", (req, res) => {
  const { esp } = req.query;
  if (states[esp]) {
    res.send(`${states[esp].targetAngle},${states[esp].id}`);
  } else {
    res.status(404).send("Unknown ESP");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serwer działa na porcie " + PORT));
