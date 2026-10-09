export type HighlightPart = { text: string; match: boolean };

// One char in, one out so positions match the original; same folding as the database search (case, accents, "đ" as "d").
function foldChar(char: string): string {
  const folded = char.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return folded === "đ" ? "d" : folded.length === 1 ? folded : char.toLowerCase();
}

// Splits a name into the parts the query words matched and the rest.
export function splitByQuery(text: string, query: string): HighlightPart[] {
  const words = query.trim().split(/\s+/).map((word) => Array.from(word).map(foldChar).join("")).filter(Boolean);
  const chars = Array.from(text);
  const folded = chars.map(foldChar).join("");
  const marked = new Array<boolean>(chars.length).fill(false);

  for (const word of words) {
    for (let at = folded.indexOf(word); at !== -1; at = folded.indexOf(word, at + word.length)) {
      for (let i = at; i < at + word.length; i++) marked[i] = true;
    }
  }

  const parts: HighlightPart[] = [];
  chars.forEach((char, i) => {
    const last = parts[parts.length - 1];
    if (last && last.match === marked[i]) last.text += char;
    else parts.push({ text: char, match: marked[i] });
  });
  return parts;
}
