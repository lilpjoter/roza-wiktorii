const express = require("express");
const app = express();

// Zmienne przechowujące ostatnią komendę i jej unikalne ID
let lastCommand = "stop"; 
let commandId = 0; // Będzie się zwiększać przy każdym kliknięciu

app.use(express.static("public"));

// Strona główna z dwoma przyciskami akcji
app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Sterowanie Różą 🌹</title>
    <style>
      body { text-align:center; font-family:sans-serif; margin-top:40px; }
      .container { display: flex; justify-content: center; gap: 20px; }
      button { font-size:20px; padding:20px 40px; border-radius:10px; cursor:pointer; border: 2px solid #555; }
      #liftBtn { background-color: #a7f0a7; }
      #lowerBtn { background-color: #f0a7a7; }
    </style>
  </head>
  <body>
    <h2>Sterowanie Różą 🌹</h2>
    <div class="container">
      <button id="liftBtn" onclick="setCmd('lift')">▲ Podnieś Różę ▲</button>
      <button id="lowerBtn" onclick="setCmd('lower')">▼ Opuść Różę ▼</button>
    </div>
    <script>
      async function setCmd(cmd) {
        // Informujemy serwer o nowym poleceniu
        await fetch('/set?cmd=' + cmd);
        console.log("Wysłano komendę: " + cmd);
      }
    </script>
  </body>
  </html>`);
});

// Endpoint do ustawiania nowej komendy
app.get("/set", (req, res) => {
  const cmd = req.query.cmd;
  if (cmd === 'lift' || cmd === 'lower') {
    lastCommand = cmd;
    commandId++; // Zwiększamy ID, aby ESP wiedział, że to NOWA komenda
    console.log(`Nowa komenda: ${lastCommand}, ID: ${commandId}`);
  }
  res.send("OK");
});

// Endpoint dla ESP8266, który wysyła ostatnią komendę i jej ID
app.get("/state", (req, res) => {
  res.send(`${lastCommand},${commandId}`); // Format: "komenda,ID" np. "lift,101"
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serwer działa na porcie " + PORT));
