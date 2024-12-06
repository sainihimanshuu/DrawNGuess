export function generateWordWithBlanks(word: string): string {
  let blanks = "";
  const words = word.split(" ");
  for (let i = 0; i < words.length; i++) {
    const currWord = words[i];
    const mod = currWord.length < 5 ? currWord.length - 1 : 5;
    for (let j = 0; j < currWord.length; j++) {
      if (j === 0) continue;
      if (j % mod === 0) blanks += currWord[j];
      else blanks += "_";
    }
    if (i < words.length - 2) blanks += " ";
  }
  return blanks;
}
