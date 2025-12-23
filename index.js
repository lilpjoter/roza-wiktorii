const express = require("express");
const app = express();

// Obiekt przechowujący stany
// targetAngle: kąt (0-180), id: licznik zmian (żeby ESP wiedziało, że to nowe polecenie)
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
    <title>Sterowanie Różami 🌹</title>
    <style>
      body { text-align:center; font-family:sans-serif; background-color: #f4f4f4; }
      .container { background: white; border: 1px solid #ddd; border-radius: 15px; padding: 20px; margin: 20px auto; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      h2 { margin-top: 0; color: #333; }
      
      input[type=number] { padding: 10px; font-size: 18px; width: 60%; border-radius: 5px; border: 1px solid #ccc; text-align: center; }
      .send-btn { padding: 10px 20px; font-size: 18px; background-color: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 5px; }
      .send-btn:active { background-color: #218838; }

      .presets button { margin: 5px; padding: 10px; width: 45%; cursor:pointer; }
    </style>
  </head>
  <body>
    <h1>🌹 Centrum Sterowania</h1>

    <div class="container">
      <h2>Ustaw Kąt (0-180°)</h2>
      <div>
        <input type="number" id="angleInput" placeholder="Np. 90" min="0" max="180">
        <button class="send-btn" onclick="sendCustomAngle()">Wyślij</button>
      </div>
      <p><small>Wartość zostanie wysłana do obu urządzeń.</small></p>
    </div>

    <div class="container presets">
      <h2>Szybkie Ustawienia</h2>
      <button onclick="setGlobalAngle(0)">Zamknij (0°)</button>
      <button onclick="setGlobalAngle(90)">Środek (90°)</button>
      <button onclick="setGlobalAngle(180)">Otwórz (180°)</button>
    </div>

    <script>
      function setGlobalAngle(angle) {
        fetch(\`/setAll?angle=\${angle}\`)
          .then(res => console.log('Wysłano kąt:', angle));
      }

      function sendCustomAngle() {
        const val = document.getElementById('angleInput').value;
        if(val !== "") {
            setGlobalAngle(val);
        } else {
            alert("Wpisz wartość!");
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
      states[esp].id++; // Zwiększamy ID, żeby ESP wiedziało, że to nowa komenda
    }
    console.log(`Globalny rozkaz: Kąt ${newAngle}`);
    res.send("OK");
  } else {
    res.status(400).send("Bad Value");
  }
});

// Endpoint dla ESP do pobierania stanu
// Zwraca format: KAT,ID (np. "90,15")
app.get("/state", (req, res) => {
  const { esp } = req.query; // ESP musi podać swoje imię: ?esp=esp1
  if (states[esp]) {
    res.send(`${states[esp].targetAngle},${states[esp].id}`);
  } else {
    res.status(404).send("Unknown ESP");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serwer działa na porcie " + PORT));
