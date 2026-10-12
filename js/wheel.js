const COLORS = ["#ffcf84", "#a9e2cd", "#c5b2f2", "#ff9a86", "#f6b6d1"];
const TAU = Math.PI * 2;

function getTargetRotation(currentRotation, winnerIndex, choiceCount, extraTurns) {
  const slice = TAU / choiceCount;
  const desiredRotation = -(winnerIndex + 0.5) * slice;
  const remainingRotation = ((desiredRotation - currentRotation) % TAU + TAU) % TAU;
  return currentRotation + extraTurns * TAU + remainingRotation;
}

export function drawWheel(choices = [], canvas, rotation = 0) {
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  const size = canvas.width;
  const center = size / 2;
  const radius = size / 2 - 12;

  context.clearRect(0, 0, size, size);
  context.save();
  context.translate(center, center);
  context.rotate(rotation);

  if (!choices.length) {
    context.restore();
    return;
  }

  const slice = TAU / choices.length;

  choices.forEach((choice, index) => {
    const start = -Math.PI / 2 + index * slice;

    context.beginPath();
    context.moveTo(0, 0);
    context.arc(0, 0, radius, start, start + slice);
    context.closePath();
    context.fillStyle = COLORS[index % COLORS.length];
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = "rgba(255,255,255,0.7)";
    context.stroke();

    context.save();
    context.rotate(start + slice / 2);
    context.textAlign = "right";
    context.textBaseline = "middle";
    context.fillStyle = "#292441";
    context.font = `700 ${Math.max(11, Math.min(22, 170 / choices.length))}px "DM Sans", sans-serif`;
    const maxChars = choices.length <= 8 ? 18 : 12;
    const label = choice.length > maxChars ? `${choice.slice(0, maxChars - 1)}…` : choice;
    context.fillText(label, radius - 24, 0, radius * 0.7);
    context.restore();
  });

  context.restore();
}

export function spinWheel(canvas, choices, onResult, options = {}) {
  const { status, onSpinState } = options;
  const reducedMotion = typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  if (!canvas || !choices || choices.length < 2) {
    if (status) status.textContent = "Add at least two choices before spinning.";
    return Promise.resolve(null);
  }

  const currentRotation = Number(canvas.dataset.rotation || "0");
  const winnerIndex = Math.floor(Math.random() * choices.length);
  const extraTurns = reducedMotion.matches ? 2 : 5 + Math.floor(Math.random() * 3);
  const targetRotation = getTargetRotation(currentRotation, winnerIndex, choices.length, extraTurns);
  const duration = reducedMotion.matches ? 900 : 4500;
  const startedAt = performance.now();

  if (status) status.textContent = "The wheel is spinning…";
  onSpinState?.(true);

  return new Promise((resolve) => {
    function frame(now) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      const nextRotation = currentRotation + (targetRotation - currentRotation) * eased;
      canvas.dataset.rotation = String(nextRotation);
      drawWheel(choices, canvas, nextRotation);

      if (progress < 1) {
        requestAnimationFrame(frame);
        return;
      }

      canvas.dataset.rotation = String(targetRotation);
      drawWheel(choices, canvas, targetRotation);
      const winner = choices[winnerIndex];
      if (status) status.textContent = `The wheel picked ${winner}.`;
      onSpinState?.(false);
      onResult?.(winner, winnerIndex);
      resolve(winner);
    }

    requestAnimationFrame(frame);
  });
}

export function createWheel(canvas, status, onWinner, onSpinState) {
  let rotation = 0;
  let spinning = false;
  let currentChoices = [];

  function draw(choices = currentChoices) {
    currentChoices = [...choices];
    drawWheel(currentChoices, canvas, rotation);
  }

  function spin() {
    if (spinning || currentChoices.length < 2) {
      if (currentChoices.length < 2 && status) status.textContent = "Add at least two choices before spinning.";
      return Promise.resolve(null);
    }

    spinning = true;
    onSpinState?.(true);
    const winnerIndex = Math.floor(Math.random() * currentChoices.length);
    const extraTurns = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 2 : 6 + Math.floor(Math.random() * 3);
    const startRotation = rotation;
    const targetRotation = getTargetRotation(startRotation, winnerIndex, currentChoices.length, extraTurns);
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 900 : 4800;
    const startedAt = performance.now();

    if (status) status.textContent = "The wheel is spinning…";

    return new Promise((resolve) => {
      function frame(now) {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 4);
        rotation = startRotation + (targetRotation - startRotation) * eased;
        drawWheel(currentChoices, canvas, rotation);

        if (progress < 1) {
          requestAnimationFrame(frame);
          return;
        }

        rotation = targetRotation;
        drawWheel(currentChoices, canvas, rotation);
        spinning = false;
        const winner = currentChoices[winnerIndex];
        if (status) status.textContent = `The wheel picked ${winner}.`;
        onSpinState?.(false);
        onWinner?.(winner, winnerIndex);
        resolve(winner);
      }

      requestAnimationFrame(frame);
    });
  }

  return {
    draw,
    spin,
    isSpinning: () => spinning,
  };
}
