const express = require("express");
const app = express();

// Przechowujemy kąt i ID zmiany dla każdego ESP
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
    <title>Sterowanie MG996R 🌹</title>
    <style>
      body { text-align:center; font-family:sans-serif; background-color: #f4f4f4; padding: 20px; }
      .container { background: white; border: 1px solid #ddd; border-radius: 15px; padding: 20px; margin: 10px auto; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      input[type=number] { padding: 12px; font-size: 20px; width: 60%; text-align: center; border-radius: 5px; border: 1px solid #ccc; }
      .send-btn { padding: 12px 20px; font-size: 20px; background-color: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 5px; }
      .presets { margin-top: 20px; display: flex; justify-content: space-between; flex-wrap: wrap; }
      .presets button { padding: 15px; width: 30%; font-size: 16px; margin-bottom: 10px; cursor: pointer; border-radius: 5px; border: 1px solid #aaa; background: #e9e9e9; }
    </style>
  </head>
  <body>
    <h1>🌹 Sterowanie Różami</h1>

    <div class="container">
      <h2>Wpisz Kąt (0-180)</h2>
      <div>
        <input type="number" id="angleInput" placeholder="0 - 180">
        <button class="send-btn" onclick="sendCustomAngle()">Wyślij</button>
      </div>
    </div>

    <div class="container">
      <h3>Szybkie Ustawienia</h3>
      <div class="presets">
        <button onclick="setGlobalAngle(0)">0° (Min)</button>
        <button onclick="setGlobalAngle(45)">45°</button>
        <button onclick="setGlobalAngle(90)">90° (Środek)</button>
        <button onclick="setGlobalAngle(135)">135°</button>
        <button onclick="setGlobalAngle(180)">180° (Max)</button>
      </div>
    </div>

    <script>
      function setGlobalAngle(angle) {
        fetch(\`/setAll?angle=\${angle}\`)
          .then(res => console.log('Wysłano kąt:', angle))
          .catch(err => alert('Błąd połączenia!'));
      }

      function sendCustomAngle() {
        const val = document.getElementById('angleInput').value;
        if(val !== "") {
          setGlobalAngle(val);
        } else {
          alert("Wpisz jakąś liczbę!");
        }
      }
    </script>
  </body>
  </html>`);
});

// Endpoint ustawiający kąt dla WSZYSTKICH
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

// Endpoint dla ESP
app.get("/state", (req, res) => {
  const { esp } = req.query;
  if (states[esp]) {
    res.send(`${states[esp].targetAngle},${states[esp].id}`);
  } else {
    res.status(404).send("Unknown ESP");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serwer startuje na porcie " + PORT));
