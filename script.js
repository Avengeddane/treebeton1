const PLATE_L = 120;
const PLATE_W = 60;

document.getElementById("calcBtn").addEventListener("click", calculate);

function calcCuts(roomSize, plateSize, minPiece) {
  let fullPlates = Math.floor(roomSize / plateSize);
  let remainder = roomSize - (fullPlates * plateSize);

  if (remainder === 0) {
    return {
      fullPlates,
      startPiece: 0,
      endPiece: 0,
      remainder,
      valid: true
    };
  }

  let startPiece = remainder / 2;
  let endPiece = remainder / 2;

  if (startPiece < minPiece || endPiece < minPiece) {
    if (remainder < minPiece * 2) {
      return {
        fullPlates,
        startPiece,
        endPiece,
        remainder,
        valid: false
      };
    } else {
      startPiece = minPiece;
      endPiece = remainder - minPiece;
    }
  }

  return {
    fullPlates,
    startPiece,
    endPiece,
    remainder,
    valid: true
  };
}

function drawSketch(canvasId, roomL, roomW, plateL, plateW, cutsL, cutsW) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  canvas.width = 900;
  canvas.height = 450;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let scaleX = (canvas.width - 40) / roomL;
  let scaleY = (canvas.height - 40) / roomW;
  let scale = Math.min(scaleX, scaleY);

  let offsetX = 20;
  let offsetY = 20;

  let drawRoomL = roomL * scale;
  let drawRoomW = roomW * scale;

  // Rum
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.strokeRect(offsetX, offsetY, drawRoomL, drawRoomW);

  // Lodrette streger (plader i længden)
  let x = cutsL.startPiece;
  while (x < roomL) {
    let drawX = offsetX + x * scale;
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(drawX, offsetY);
    ctx.lineTo(drawX, offsetY + drawRoomW);
    ctx.stroke();
    x += plateL;
  }

  // Vandrette streger (plader i bredden)
  let y = cutsW.startPiece;
  while (y < roomW) {
    let drawY = offsetY + y * scale;
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(offsetX, drawY);
    ctx.lineTo(offsetX + drawRoomL, drawY);
    ctx.stroke();
    y += plateW;
  }

  // Tekst
  ctx.fillStyle = "black";
  ctx.font = "16px Arial";
  ctx.fillText(`Rum: ${roomL} x ${roomW} cm`, 30, 20);

  ctx.font = "14px Arial";
  ctx.fillText(`Plade: ${plateL} x ${plateW} cm`, 30, 40);

  ctx.fillText(`Start/Slut længde: ${cutsL.startPiece.toFixed(1)} / ${cutsL.endPiece.toFixed(1)} cm`, 30, 60);
  ctx.fillText(`Start/Slut bredde: ${cutsW.startPiece.toFixed(1)} / ${cutsW.endPiece.toFixed(1)} cm`, 30, 80);
}

function scoreLayout(cutsL, cutsW) {
  if (!cutsL.valid || !cutsW.valid) return 999999;
  return cutsL.remainder + cutsW.remainder;
}

function calculate() {
  let length = parseFloat(document.getElementById("length").value);
  let width = parseFloat(document.getElementById("width").value);
  let minPiece = parseFloat(document.getElementById("minPiece").value);

  if (isNaN(length) || isNaN(width) || length <= 0 || width <= 0) {
    alert("Indtast gyldige mål i cm.");
    return;
  }

  let layout1 = {
    plateL: PLATE_L,
    plateW: PLATE_W,
    cutsL: calcCuts(length, PLATE_L, minPiece),
    cutsW: calcCuts(width, PLATE_W, minPiece)
  };

  let layout2 = {
    plateL: PLATE_W,
    plateW: PLATE_L,
    cutsL: calcCuts(length, PLATE_W, minPiece),
    cutsW: calcCuts(width, PLATE_L, minPiece)
  };

  let score1 = scoreLayout(layout1.cutsL, layout1.cutsW);
  let score2 = scoreLayout(layout2.cutsL, layout2.cutsW);

  let best = score1 <= score2 ? "Layout 1" : "Layout 2";

  function statusText(layout) {
    if (layout.cutsL.valid && layout.cutsW.valid) {
      return `<span class="ok">OK (ingen stykker under ${minPiece} cm)</span>`;
    }
    return `<span class="warning">ADVARSEL: Kan ikke undgå stykker under ${minPiece} cm</span>`;
  }

  let out = document.getElementById("output");
  out.style.display = "block";

  out.innerHTML = `
    <h2>Resultat</h2>

    <div class="layout">
      <h3>Layout 1 (120 cm langs længde, 60 cm langs bredde)</h3>
      <p>${statusText(layout1)}</p>

      <p><b>Længde:</b> ${layout1.cutsL.fullPlates} hele plader + rest ${layout1.cutsL.remainder.toFixed(1)} cm</p>
      <p>Start/slut: ${layout1.cutsL.startPiece.toFixed(1)} / ${layout1.cutsL.endPiece.toFixed(1)} cm</p>

      <p><b>Bredde:</b> ${layout1.cutsW.fullPlates} hele plader + rest ${layout1.cutsW.remainder.toFixed(1)} cm</p>
      <p>Start/slut: ${layout1.cutsW.startPiece.toFixed(1)} / ${layout1.cutsW.endPiece.toFixed(1)} cm</p>

      <canvas id="canvas1"></canvas>
    </div>

    <div class="layout">
      <h3>Layout 2 (drejet: 60 cm langs længde, 120 cm langs bredde)</h3>
      <p>${statusText(layout2)}</p>

      <p><b>Længde:</b> ${layout2.cutsL.fullPlates} hele plader + rest ${layout2.cutsL.remainder.toFixed(1)} cm</p>
      <p>Start/slut: ${layout2.cutsL.startPiece.toFixed(1)} / ${layout2.cutsL.endPiece.toFixed(1)} cm</p>

      <p><b>Bredde:</b> ${layout2.cutsW.fullPlates} hele plader + rest ${layout2.cutsW.remainder.toFixed(1)} cm</p>
      <p>Start/slut: ${layout2.cutsW.startPiece.toFixed(1)} / ${layout2.cutsW.endPiece.toFixed(1)} cm</p>

      <canvas id="canvas2"></canvas>
    </div>

    <div class="layout">
      <h3>Anbefaling</h3>
      <p><b>Bedste valg:</b> ${best}</p>
      <p>(baseret på mindst samlet rest og undgåelse af små kantstykker)</p>
    </div>
  `;

  drawSketch("canvas1", length, width, layout1.plateL, layout1.plateW, layout1.cutsL, layout1.cutsW);
  drawSketch("canvas2", length, width, layout2.plateL, layout2.plateW, layout2.cutsL, layout2.cutsW);
}
