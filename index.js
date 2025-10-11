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
      .esp-container { border: 2px solid #ccc; border-radius: 15px; padding: 10px; margin: 20px auto; max-width: 400px; }
      .pos-buttons button { display: block; width: 90%; margin: 10px auto; font-size:16px; padding:12px; border-radius:8px; cursor:pointer; }
      .manual-buttons { display: flex; justify-content: center; gap: 10px; margin-top: 15px; }
      .manual-buttons button { font-size:14px; padding:15px; border-radius:8px; cursor:pointer; -webkit-user-select: none; user-select: none; }
      .manual-up { background-color: #a7f0a7; }
      .manual-down { background-color: #f0a7a7; }
    </style>
  </head>
  <body>
    <h1>Sterowanie Różami</h1>

    <!-- Panel sterowania dla ESP 1 -->
    <div class="esp-container">
      <h2>Róża 1</h2>
      <div class="pos-buttons">
        <button onclick="setCommand('esp1', 'pos1')">Pozycja 1 (Dół)</button>
        <button onclick="setCommand('esp1', 'pos2')">Pozycja 2</button>
        <button onclick="setCommand('esp1', 'pos3')">Pozycja 3</button>
        <button onclick="setCommand('esp1', 'pos4')">Pozycja 4 (Góra)</button>
      </div>
      <p><strong>Dostrojenie ręczne (przytrzymaj):</strong></p>
      <div class="manual-buttons">
        <button class="manual-up" id="esp1_up">▲ Wolno w górę ▲</button>
        <button class="manual-down" id="esp1_down">▼ Wolno w dół ▼</button>
      </div>
    </div>

    <!-- Panel sterowania dla ESP 2 -->
    <div class="esp-container">
      <h2>Róża 2</h2>
      <div class="pos-buttons">
        <button onclick="setCommand('esp2', 'pos1')">Pozycja 1 (Dół)</button>
        <button onclick="setCommand('esp2', 'pos2')">Pozycja 2</button>
        <button onclick="setCommand('esp2', 'pos3')">Pozycja 3</button>
        <button onclick="setCommand('esp2', 'pos4')">Pozycja 4 (Góra)</button>
      </div>
      <p><strong>Dostrojenie ręczne (przytrzymaj):</strong></p>
      <div class="manual-buttons">
        <button class="manual-up" id="esp2_up">▲ Wolno w górę ▲</button>
        <button class="manual-down" id="esp2_down">▼ Wolno w dół ▼</button>
      </div>
    </div>

    <script>
      function setCommand(esp, cmd) {
        fetch(\`/set?esp=\${esp}&cmd=\${cmd}\`);
      }

      function setupManualControls(espId) {
        const upButton = document.getElementById(espId + '_up');
        const downButton = document.getElementById(espId + '_down');
        const stopCommand = () => setCommand(espId, 'stop');

        // W GÓRĘ
        upButton.addEventListener('mousedown', () => setCommand(espId, 'manual_up'));
        upButton.addEventListener('touchstart', (e) => { e.preventDefault(); setCommand(espId, 'manual_up'); });
        upButton.addEventListener('mouseup', stopCommand);
        upButton.addEventListener('mouseleave', stopCommand);
        upButton.addEventListener('touchend', stopCommand);

        // W DÓŁ
        downButton.addEventListener('mousedown', () => setCommand(espId, 'manual_down'));
        downButton.addEventListener('touchstart', (e) => { e.preventDefault(); setCommand(espId, 'manual_down'); });
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

app.get("/set", (req, res) => {
  const { esp, cmd } = req.query;
  if (states[esp]) {
    states[esp].command = cmd;
    states[esp].id++; // Zwiększ ID, aby ESP wiedział, że to nowa komenda
    console.log(`Nowa komenda dla ${esp}: ${cmd} (ID: ${states[esp].id})`);
  }
  res.send("OK");
});

app.get("/state", (req, res) => {
  const { esp } = req.query;
  if (states[esp]) {
    const { command, id } = states[esp];
    res.send(`${command},${id}`); // Zwraca np. "pos3,101" lub "manual_up,102"
  } else {
    res.status(404).send("Unknown ESP");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serwer działa na porcie " + PORT));
