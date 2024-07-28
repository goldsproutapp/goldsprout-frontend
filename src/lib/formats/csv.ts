export function parseCSV(csv: string): string[] {
  const outputs = [];
  let builder = '';
  let lastChar = '';
  let escapeNext = false;
  let inQuote = false;
  for (const char of csv) {
    if (escapeNext) {
      builder += char;
      escapeNext = false;
      continue;
    }
    if (char == '\\') {
      escapeNext = true;
      continue;
    }
    escapeNext = false;
    if (char == '"') {
      inQuote = !inQuote;
      continue;
    }
    if (char == ',' && !inQuote) {
      outputs.push(builder);
      builder = '';
      continue;
    }
    builder += char;
    lastChar = char;
  }
  if (lastChar != ',') outputs.push(builder);

  return outputs;
}

export function processFormat(format: string): { [key: string]: number } {
  const obj: { [key: string]: number } = {};
  format.split(',').forEach((heading, i) => {
    if (heading !== '_') obj[heading] = i;
  });
  return obj;
}
