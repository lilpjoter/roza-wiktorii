const express = require("express");
const app = express();

// Zmienna przechowująca aktualny stan polecenia dla serwa
let currentCommand = 'stop'; // 'lift', 'lower', or 'stop'

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
    <title>Sterowanie Różą 🌹</title>
    <style>
      body { text-align:center; font-family:sans-serif; margin-top:40px; touch-action: manipulation; }
      .container { display: flex; flex-direction: column; align-items: center; gap: 20px; }
      button { 
        font-size: 20px; 
        padding: 25px 50px; 
        border-radius: 10px; 
        cursor: pointer; 
        border: 2px solid #555;
        width: 80%;
        max-width: 300px;
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10+ */
        user-select: none; /* Standard */
      }
      #liftBtn { background-color: #a7f0a7; }
      #lowerBtn { background-color: #f0a7a7; }
    </style>
  </head>
  <body>
    <h2>Sterowanie Różą 🌹</h2>
    <p>Naciśnij i przytrzymaj przycisk, aby poruszyć serwem.</p>
    <div class="container">
      <button id="liftBtn">▲ Podnieś ▲</button>
      <button id="lowerBtn">▼ Opuść ▼</button>
    </div>
    <script>
      const liftButton = document.getElementById('liftBtn');
      const lowerButton = document.getElementById('lowerBtn');

      // Funkcja wysyłająca komendę do serwera
      const sendCommand = (cmd) => fetch('/set?cmd=' + cmd);

      // --- Zdarzenia dla przycisku "Podnieś" ---
      // Mysz: naciśnięcie
      liftButton.addEventListener('mousedown', () => sendCommand('lift'));
      // Mysz: puszczenie lub wyjechanie kursorem poza przycisk
      liftButton.addEventListener('mouseup', () => sendCommand('stop'));
      liftButton.addEventListener('mouseleave', () => sendCommand('stop'));
      // Dotyk: naciśnięcie
      liftButton.addEventListener('touchstart', (e) => { e.preventDefault(); sendCommand('lift'); });
      // Dotyk: puszczenie
      liftButton.addEventListener('touchend', () => sendCommand('stop'));


      // --- Zdarzenia dla przycisku "Opuść" ---
      lowerButton.addEventListener('mousedown', () => sendCommand('lower'));
      lowerButton.addEventListener('mouseup', () => sendCommand('stop'));
      lowerButton.addEventListener('mouseleave', () => sendCommand('stop'));
      lowerButton.addEventListener('touchstart', (e) => { e.preventDefault(); sendCommand('lower'); });
      lowerButton.addEventListener('touchend', () => sendCommand('stop'));
    </script>
  </body>
  </html>`);
});

// Endpoint do ustawiania komendy
app.get("/set", (req, res) => {
  const cmd = req.query.cmd;
  if (['lift', 'lower', 'stop'].includes(cmd)) {
    currentCommand = cmd;
    console.log(`Nowa komenda: ${currentCommand}`);
  }
  res.send("OK");
});

// Endpoint dla ESP8266 - zwraca aktualną komendę
app.get("/state", (req, res) => {
  res.send(currentCommand);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serwer działa na porcie " + PORT));
