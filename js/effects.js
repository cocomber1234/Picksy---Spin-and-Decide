function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeWheelState(choices, category) {
  return {
    choices: encodeBase64(JSON.stringify(choices)),
    category,
  };
}

export function decodeWheelState(value) {
  if (typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(decodeBase64(value));
    return Array.isArray(parsed) ? parsed.map((choice) => String(choice).trim()).filter(Boolean) : null;
  } catch {
    return null;
  }
}

export function celebrate() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#ff806c", "#ffd66b", "#86d8bb", "#b9a3f4", "#f6b6d1"];
  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  layer.setAttribute("aria-hidden", "true");
  for (let index = 0; index < 40; index += 1) {
    const piece = document.createElement("i");
    piece.className = "confetti-piece";
    piece.style.setProperty("--confetti-color", colors[index % colors.length]);
    piece.style.setProperty("--confetti-x", `${Math.random() * 100}vw`);
    piece.style.setProperty("--confetti-delay", `${Math.random() * 450}ms`);
    piece.style.setProperty("--confetti-rotation", `${Math.random() * 360}deg`);
    layer.append(piece);
  }
  document.body.append(layer);
  window.setTimeout(() => layer.remove(), 2600);
}

export async function shareChoices(choices, category) {
  const url = new URL(window.location.href);
  const params = new URLSearchParams();
  params.set("choices", encodeBase64(JSON.stringify(choices)));
  params.set("category", category);
  url.search = params.toString();
  if (navigator.share) {
    await navigator.share({ title: "My Picksy wheel", url: url.toString() });
    return "shared";
  }
  try {
    await navigator.clipboard.writeText(url.toString());
    return "copied";
  } catch {
    const field = document.createElement("textarea");
    field.value = url.toString();
    field.setAttribute("readonly", "");
    field.className = "share-fallback";
    document.body.append(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied ? "copied" : "unavailable";
  }
}
