// @ts-ignore
import data_from_json from "../data.json";

interface Data {
  name: string;
  description: string;
}

const data: Data[] = data_from_json;

const SEARCH_TERM = "wha";

let results = [];

for (const item of data) {
  const nameLev = levenshtein(item.name, SEARCH_TERM);

  let minDescriptionLev;
  for (const word of item.description.split(" ")) {
    let distance = levenshtein(word, SEARCH_TERM);
    if (typeof minDescriptionLev === "number") {
      minDescriptionLev = Math.min(distance, minDescriptionLev);
    } else {
      minDescriptionLev = distance;
    }
  }

  let totalLev = nameLev;
  if (typeof minDescriptionLev === "number") {
    totalLev += minDescriptionLev;
  }

  results.push({
    ...item,
    nameLev,
    minDescriptionLev,
    totalLev,
  });
}

console.log(results.sort((a, b) => a.totalLev - b.totalLev));

// LEVENSHTEIN

function levenshtein(word: string, searchTerm: string) {
  word = word.toLowerCase();
  searchTerm = searchTerm.toLowerCase();

  const matrix: number[][] = [];

  // increment along the first column of each row
  for (let i = 0; i <= searchTerm.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  for (let j = 0; j <= word.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= searchTerm.length; i++) {
    for (let j = 1; j <= word.length; j++) {
      if (searchTerm.charAt(i - 1) == word.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1
          )
        ); // deletion
      }
    }
  }

  return matrix[searchTerm.length][word.length];
}
