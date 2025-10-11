const express = require("express");
const app = express();

// Obiekt przechowujący stany dla obu ESP
let states = {
  esp1: { command: 'pos1', id: 0 },
  esp2: { command: 'pos1', id: 0 }
};

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
    <title>Sterowanie Różami 🌹</title>
    <style>
      body { text-align:center; font-family:sans-serif; }
      .container { border: 2px solid #ccc; border-radius: 15px; padding: 10px; margin: 20px auto; max-width: 400px; }
      .container h2 { margin-top: 10px; }
      .pos-buttons button { display: block; width: 90%; margin: 10px auto; font-size:16px; padding:12px; border-radius:8px; cursor:pointer; background-color: #e0e0e0; }
      .manual-buttons { display: flex; justify-content: center; gap: 10px; margin-top: 15px; }
      .manual-buttons button { font-size:14px; padding:15px; border-radius:8px; cursor:pointer; -webkit-user-select: none; user-select: none; }
      .manual-up { background-color: #a7f0a7; }
      .manual-down { background-color: #f0a7a7; }
    </style>
  </head>
  <body>
    <h1>Sterowanie Różami</h1>

    <!-- Panel sterowania GŁÓWNEGO dla obu róż -->
    <div class="container">
      <h2>Pozycje dla Obu Róż</h2>
      <div class="pos-buttons">
        <button onclick="setAllCommand('pos1')">Pozycja 1 (Dół)</button>
        <button onclick="setAllCommand('pos2')">Pozycja 2</button>
        <button onclick="setAllCommand('pos3')">Pozycja 3</button>
        <button onclick="setAllCommand('pos4')">Pozycja 4 (Góra)</button>
      </div>
    </div>

    <!-- Panel sterowania RĘCZNEGO dla Róży 1 -->
    <div class="container">
      <h2>Dostrajanie Ręczne: Róża 1</h2>
      <div class="manual-buttons">
        <button class="manual-up" id="esp1_up">▲ Wolno w górę ▲</button>
        <button class="manual-down" id="esp1_down">▼ Wolno w dół ▼</button>
      </div>
    </div>

    <!-- Panel sterowania RĘCZNEGO dla Róży 2 -->
    <div class="container">
      <h2>Dostrajanie Ręczne: Róża 2</h2>
      <div class="manual-buttons">
        <button class="manual-up" id="esp2_up">▲ Wolno w górę ▲</button>
        <button class="manual-down" id="esp2_down">▼ Wolno w dół ▼</button>
      </div>
    </div>

    <script>
      // Wysyła komendę do konkretnego ESP (dla sterowania ręcznego)
      function setIndividualCommand(esp, cmd) {
        fetch(\`/set?esp=\${esp}&cmd=\${cmd}\`);
      }
      
      // Wysyła komendę do WSZYSTKICH ESP (dla przycisków pozycji)
      function setAllCommand(cmd) {
        fetch(\`/setAll?cmd=\${cmd}\`);
      }

      // Konfiguracja przycisków do sterowania ręcznego
      function setupManualControls(espId) {
        const upButton = document.getElementById(espId + '_up');
        const downButton = document.getElementById(espId + '_down');
        const stopCommand = () => setIndividualCommand(espId, 'stop');

        upButton.addEventListener('mousedown', () => setIndividualCommand(espId, 'manual_up'));
        upButton.addEventListener('touchstart', (e) => { e.preventDefault(); setIndividualCommand(espId, 'manual_up'); });
        upButton.addEventListener('mouseup', stopCommand);
        upButton.addEventListener('mouseleave', stopCommand);
        upButton.addEventListener('touchend', stopCommand);

        downButton.addEventListener('mousedown', () => setIndividualCommand(espId, 'manual_down'));
        downButton.addEventListener('touchstart', (e) => { e.preventDefault(); setIndividualCommand(espId, 'manual_down'); });
        downButton.addEventListener('mouseup', stopCommand);
        downButton.addEventListener('mouseleave', stopCommand);
        downButton.addEventListener('touchend', stopCommand);
      }

      setupManualControls('esp1');
      setupManualControls('esp2');
    </script>
  </body>
  </html>`);
});

// Endpoint do ustawiania komendy dla JEDNEGO ESP (sterowanie ręczne)
app.get("/set", (req, res) => {
  const { esp, cmd } = req.query;
  if (states[esp]) {
    states[esp].command = cmd;
    states[esp].id++;
    console.log(`Nowa komenda dla ${esp}: ${cmd} (ID: ${states[esp].id})`);
  }
  res.send("OK");
});

// NOWY endpoint do ustawiania komendy dla WSZYSTKICH ESP (pozycje)
app.get("/setAll", (req, res) => {
  const { cmd } = req.query;
  for (const esp in states) {
    states[esp].command = cmd;
    states[esp].id++;
  }
  console.log(`Nowa komenda GLOBALNA: ${cmd}`);
  res.send("OK");
});

// Endpoint dla ESP do pobierania swojego stanu - bez zmian
app.get("/state", (req, res) => {
  const { esp } = req.query;
  if (states[esp]) {
    const { command, id } = states[esp];
    res.send(`${command},${id}`);
  } else {
    res.status(404).send("Unknown ESP");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serwer działa na porcie " + PORT));
