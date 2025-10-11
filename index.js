const express = require("express");
const app = express();

// Zmienna przechowująca docelową pozycję róży (1-4)
let targetPosition = 1;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Sterowanie Różą 🌹</title>
    <style>
      body { text-align:center; font-family:sans-serif; margin-top:40px; }
      .container { display: flex; flex-direction: column; align-items: center; gap: 15px; }
      button { font-size:18px; padding:15px 30px; border-radius:10px; cursor:pointer; width: 80%; max-width: 300px; }
      .pos { font-size:22px; margin-top:20px; }
    </style>
  </head>
  <body>
    <h2>Ustaw pozycję Róży 🌹</h2>
    <div class="container">
      <button onclick="setPos(1)">Pozycja 1 (Na dole)</button>
      <button onclick="setPos(2)">Pozycja 2</button>
      <button onclick="setPos(3)">Pozycja 3</button>
      <button onclick="setPos(4)">Pozycja 4 (W górze)</button>
    </div>
    <div class="pos">Aktualne polecenie: Pozycja <span id="pos">${targetPosition}</span></div>
    <script>
      async function setPos(p) {
        await fetch('/set?pos=' + p);
        document.getElementById('pos').innerText = p;
      }
    </script>
  </body>
  </html>`);
});

// Endpoint do ustawiania docelowej pozycji
app.get("/set", (req, res) => {
  const pos = parseInt(req.query.pos);
  if (pos >= 1 && pos <= 4) {
    targetPosition = pos;
    console.log("Ustawiono nową pozycję docelową:", targetPosition);
  }
  res.send("OK");
});

// Endpoint dla ESP8266 - zwraca docelową pozycję
app.get("/state", (req, res) => {
  res.send(targetPosition.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serwer działa na porcie " + PORT));
