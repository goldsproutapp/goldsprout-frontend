
export function parseCSV(csv: string): string[] {
    const outputs = [];
    let builder = "";
    let escapeNext = false;
    let inQuote = false;
    for (let char of csv) {
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
    }

    return outputs;

}
