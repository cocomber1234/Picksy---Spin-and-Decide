// Choice-panel contract. Rendering and validation can be expanded without
// coupling the rest of the app to this module's DOM details.
function normalizeChoice(text) {
  return String(text ?? "").trim();
}

export function createChoicesPanel({ list, count, form, input, onChange }) {
  const render = (choices) => {
    list.replaceChildren(...choices.map((choice, index) => {
      const item = document.createElement("li");
      item.className = "choice-item";

      const dot = document.createElement("span");
      dot.className = `choice-dot ${["dot-peach", "dot-lilac", "dot-mint", "dot-yellow"][index % 4]}`;
      dot.setAttribute("aria-hidden", "true");

      const name = document.createElement("span");
      name.className = "choice-name";
      name.textContent = choice;

      const edit = document.createElement("button");
      edit.className = "choice-edit";
      edit.type = "button";
      edit.textContent = "···";
      edit.setAttribute("aria-label", `Edit ${choice}`);

      const remove = document.createElement("button");
      remove.className = "choice-remove";
      remove.type = "button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Remove ${choice}`);

      item.append(dot, name, edit, remove);
      return item;
    }));

    if (count) count.textContent = String(choices.length);
    onChange?.(choices);
  };

  function getChoices() {
    return [...list.querySelectorAll(".choice-name")].map((item) => item.textContent.trim());
  }

  function setChoices(choices) {
    const normalized = (Array.isArray(choices) ? choices : [])
      .map((choice) => normalizeChoice(choice))
      .filter(Boolean)
      .slice(0, 20);
    render(normalized);
  }

  function addChoice(value) {
    const cleaned = normalizeChoice(value);
    const current = getChoices();

    if (!cleaned || current.length >= 20) return false;
    if (current.some((choice) => choice.toLowerCase() === cleaned.toLowerCase())) return false;

    setChoices([...current, cleaned]);
    return true;
  }

  function removeChoice(value) {
    const cleaned = normalizeChoice(value);
    const current = getChoices();
    const next = current.filter((choice) => choice !== cleaned);
    setChoices(next);
    return next;
  }

  function editChoice(oldValue, nextValue) {
    const oldChoice = normalizeChoice(oldValue);
    const nextChoice = normalizeChoice(nextValue);
    const current = getChoices();

    if (!oldChoice || !nextChoice || current.length >= 20) return false;
    if (current.some((choice) => choice !== oldChoice && choice.toLowerCase() === nextChoice.toLowerCase())) return false;

    const updated = current.map((choice) => choice === oldChoice ? nextChoice : choice);
    setChoices(updated);
    return true;
  }

  function clearAll() {
    setChoices([]);
    return [];
  }

  return {
    getChoices,
    setChoices,
    addChoice,
    removeChoice,
    editChoice,
    clearAll,
    form,
    input,
  };
}
