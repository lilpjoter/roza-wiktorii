const express = require("express");
const app = express();

// Przechowujemy cel (np. 1080) i ID
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
    <title>Sterowanie MULTI-TURN 🌹</title>
    <style>
      body { text-align:center; font-family:sans-serif; background-color: #f4f4f4; padding: 20px; }
      .container { background: white; border: 1px solid #ddd; border-radius: 15px; padding: 20px; margin: 10px auto; max-width: 400px; }
      input[type=number] { padding: 12px; font-size: 20px; width: 60%; text-align: center; border-radius: 5px; }
      .send-btn { padding: 12px 20px; font-size: 20px; background-color: #6f42c1; color: white; border: none; border-radius: 5px; cursor: pointer; }
      .presets button { padding: 10px; margin: 5px; width: 45%; cursor:pointer; }
    </style>
  </head>
  <body>
    <h1>🌹 Sterowanie Wieloobrotowe</h1>
    
    <div class="container">
      <h2>Podaj Kąt (np. 1080)</h2>
      <p><small>360 = 1 obrót, 720 = 2 obroty, 1080 = 3 obroty</small></p>
      <div>
        <input type="number" id="angleInput" placeholder="0">
        <button class="send-btn" onclick="sendCustomAngle()">Jedź!</button>
      </div>
    </div>

    <div class="container presets">
      <button onclick="setGlobalAngle(0)">Powrót do 0</button>
      <button onclick="setGlobalAngle(360)">1 Obrót (360)</button>
      <button onclick="setGlobalAngle(720)">2 Obroty (720)</button>
      <button onclick="setGlobalAngle(1080)">3 Obroty (1080)</button>
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
    console.log(`Cel globalny: ${newAngle}`);
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
