const express = require("express");
const app = express();
let position = 1; // aktualna pozycja róży (1–4)

app.use(express.static("public"));

// Strona główna (prosty interfejs HTML)
app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Sterowanie różami 🌹</title>
    <style>
      body { text-align:center; font-family:sans-serif; margin-top:40px; }
      button { font-size:20px; padding:15px 30px; margin:10px; border-radius:10px; cursor:pointer; }
      .pos { font-size:22px; margin-top:20px; }
    </style>
  </head>
  <body>
    <h2>Sterowanie różami 🌹</h2>
    <button onclick="setPos(1)">Opuszczona</button>
    <button onclick="setPos(2)">Lekko podniesiona</button>
    <button onclick="setPos(3)">Średnio podniesiona</button>
    <button onclick="setPos(4)">Prosta</button>
    <div class="pos">Aktualna pozycja: <span id="pos">${position}</span></div>
    <script>
      async function setPos(p) {
        await fetch('/set?pos=' + p);
        document.getElementById('pos').innerText = p;
      }
    </script>
  </body>
  </html>`);
});

// Endpoint do ustawiania pozycji
app.get("/set", (req, res) => {
  position = parseInt(req.query.pos || "1");
  console.log("Nowa pozycja:", position);
  res.send("OK");
});

// Endpoint dla ESP8266
app.get("/state", (req, res) => {
  res.send(position.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serwer działa na porcie " + PORT));
