import { parseCSV, processFormat } from '../formats/csv';
import { TransactionAttribution, type Snapshot } from '../types';
import { fillGaps, requiredFields, validate_csv_format } from './snapshot';

const replaceCommas = ['units', 'price', 'value', 'cost', 'absolute_change'];

const HeaderMatches = {
  stock_name: [/stock|share|fund|holding|investment(([_-\s]name)|$)/i, /item([_-\s]name)?/i],
  stock_code: [
    /(stock|share|fund|holding|investment[_-\s])code/i,
    /(item)[_-\s]code/i,
    /isin/i,
    /code/i
  ],
  units: [/unit/i, /quantity/i],
  price: [/price/i],
  cost: [/cost/i],
  value: [/value/i],

  date: [/date/i],
  user: [/user|person/i],
  provider: [/provider|platform|dealer|broker|bank/i],
  account: [/account(_(type|name))?/i],
  transaction_attribution: [/(change|transaction)[_ ](reason|attribution|)/i]
};

export interface SnapshotImportRow {
  stock_code: string;
  stock_name: string;
  value: string;
  units: string;
  cost: string;
  price: string;
  absolute_change: string;
  transaction_attribution: TransactionAttribution;
}

export const SnapshotNumericFields: (keyof SnapshotImportRow)[] = [
  'units',
  'cost',
  'price',
  'value'
];

export function findHeaderRow(lines: string[], extended: boolean = false): [number, string[]] {
  let notFound = requiredFields(extended, true);
  for (const [i, line] of lines.entries()) {
    const csv = parseCSV(line);
    const parsed = new Array(csv.length).fill('_');
    for (const [j, entry] of csv.entries()) {
      for (const [key, regexes] of Object.entries(HeaderMatches)) {
        if (regexes.some((r) => r.test(entry))) {
          parsed[j] = key;
        }
      }
    }
    const [valid, missing] = validate_csv_format(parsed, extended);
    if (valid) {
      return [i, parsed];
    } else if (missing.length < notFound.length) notFound = missing;
  }
  return [-1, notFound];
}

function parseContent(
  lines: string[],
  fmt: { [key: string]: number }
): [boolean, { [key: string]: string | number }[] | string[]] {
  const out = [];
  for (const line of lines) {
    const csv = parseCSV(line);

    const obj: any = {};
    Object.entries(fmt).forEach(([key, idx]) =>
      csv[idx]
        ? (obj[key] = replaceCommas.includes(key) ? csv[idx].replace(',', '') : csv[idx])
        : {}
    );
    const [filled, err] = fillGaps(obj);
    if (err != null) {
      continue;
    }
    if (!obj.stock_name.toString().match(/^total$/i)) out.push(filled);
  }
  const errors: string[] = [];
  for (const obj of out) {
    const failures = validateTypes(obj as any);
    Object.entries(failures).forEach(([k, v]) =>
      errors.push(`Invalid numeric value for column '${k}': '${v}'`)
    );
  }
  if (errors.length > 0) return [false, errors];
  if (out.length == 0)
    return [false, ['No entries found. For an empty snapshot, use the button below.']];
  return [true, out];
}

export function parseFile(
  lines: string[],
  fallbackFormats: { [key: string]: number }[],
  extended: boolean = false
): [boolean, { [key: string]: string | number }[] | string[]] {
  const [headerIdx, headerFmt] = findHeaderRow(lines, extended);
  if (headerIdx < 0) {
    for (const fmt of fallbackFormats) {
      const [valid, data] = parseContent(lines, fmt);
      if (valid) return [valid, data];
    }
    return [
      false,
      headerFmt.map((field: string) => `Missing required field from header row: '${field}'`)
    ];
  }
  const dataLines = lines.slice(headerIdx + 1);
  return parseContent(dataLines, processFormat(headerFmt.join(',')));
}

export function promptTransactionAttribution(
  account_id: number,
  snapshots_latest: Snapshot[],
  entries: any
): [SnapshotImportRow, number][] {
  const prevSnapshots = snapshots_latest.filter((s) => s.account_id == account_id);
  const existing_ids: number[] = [];
  const notNewEntries = entries.map((e: any) => {
    const prev = prevSnapshots.find(
      ({ stock }) =>
        (stock.stock_code != '' && stock.stock_code == e.stock_code) || stock.name == e.stock_name
    );
    if (prev) {
      existing_ids.push(prev.id);
      return [e, prev];
    } else return [e, { transaction_attribution: TransactionAttribution.BuySell, units: 0 }];
  });
  const sold = prevSnapshots
    .filter((s) => !existing_ids.includes(s.id))
    .map<[SnapshotImportRow, number]>((s) => [
      {
        stock_code: s.stock.stock_code || '',
        stock_name: s.stock.name,
        value: '0',
        units: '0',
        cost: '0',
        price: s.price,
        absolute_change: '0',
        transaction_attribution: TransactionAttribution.BuySell
      },
      -parseFloat(s.units)
    ]);
  notNewEntries.forEach(([e, p]: any) => (e.transaction_attribution = p.transaction_attribution));
  const unitDiff = notNewEntries
    .map(([e, p]: any) => [e, parseFloat(e.units) - parseFloat(p.units)])
    .concat(sold);

  return unitDiff;
}

export function validateTypes(snapshot: SnapshotImportRow): {
  [key in keyof SnapshotImportRow]: string;
} {
  const failures = SnapshotNumericFields.filter((field: keyof SnapshotImportRow) =>
    isNaN(parseFloat(snapshot[field] as string))
  );
  return Object.fromEntries(
    failures.map((key: keyof SnapshotImportRow) => [key, snapshot[key]])
  ) as {
    [key in keyof SnapshotImportRow]: string;
  };
}
