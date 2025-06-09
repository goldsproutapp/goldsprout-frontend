import { TransactionAttribution } from '../types';
import { numDP } from '../utils';
import type { SnapshotImportRow } from './snapshot_import';

function contains<V>(obj: { [key: string]: V }, value: string): boolean {
  return Object.keys(obj).includes(value);
}

export function requiredFields(extended: boolean = false, forDisplay: boolean = false): string[] {
  return [
    'stock_name',
    'value',
    'cost',
    ...(extended ? ['user', 'provider', 'account', 'date', 'transaction_attribution'] : []),
    ...(forDisplay ? ['units or price'] : [])
  ];
}
export function optionalFields(): string[] {
  return ['stock_code', 'absolute_change', 'region', 'sector'];
}
export function requriedFieldDisplay(extended: boolean = false): string {
  return requiredFields(extended, true).join(',');
}

export function validate_csv_format(fmt: string[], extended: boolean = false): [boolean, string[]] {
  const missing = [];
  const required = requiredFields(extended);
  let valid = true;
  if (required.filter((key) => !fmt.includes(key)).map((key) => missing.push(key)).length != 0)
    valid = false;
  if (['units', 'price'].every((key) => !fmt.includes(key))) {
    missing.push('units or price');
    valid = false;
  }
  return [valid, missing];
}

export function fillGaps(obj: {
  [key: string]: string | TransactionAttribution;
}): [{ [key: string]: string | TransactionAttribution }, string | null] {
  // required: name, value, cost, price|units
  if (!(contains(obj, 'stock_name') && contains(obj, 'value') && contains(obj, 'cost')))
    return [{}, 'missing fields'];

  if (!contains(obj, 'price')) {
    if (!contains(obj, 'units')) return [{}, 'Must provide either price or units'];
    obj.price = (
      (Number.parseFloat(obj.value as string) / Number.parseFloat(obj.units as string)) *
      100
    ).toFixed(2);
  }
  if (!contains(obj, 'units')) {
    if (!contains(obj, 'price')) return [{}, 'Must provide either price or units'];
    obj.units = (
      (Number.parseFloat(obj.value as string) * 100) /
      Number.parseFloat(obj.price as string)
    ).toFixed(2);
  }

  if (!contains(obj, 'absolute_change')) {
    obj.absolute_change = (
      Number.parseFloat(obj.value as string) - Number.parseFloat(obj.cost as string)
    ).toFixed(2);
  }

  if (!contains(obj, 'stock_code')) obj.stock_code = '';
  if (!contains(obj, 'transaction_attribution'))
    obj.transaction_attribution = TransactionAttribution.BuySell;

  return [obj, null];
}

export function validateSnapshotRowEdit(
  oldData: SnapshotImportRow,
  newData: SnapshotImportRow
): [SnapshotImportRow, [string, number][][]] {
  const newUnits = parseFloat(newData.units);
  const newValue = parseFloat(newData.value);
  const newPrice = parseFloat(newData.price);
  let options: [string, number][][] = [];
  oldData.stock_code = newData.stock_code;
  oldData.cost = newData.cost;
  if (newData.stock_name != '') oldData.stock_name = newData.stock_name;
  if (Math.round((newUnits * newPrice) / 100) == Math.round(newValue)) {
    // @ts-expect-error this is safe, but it's difficult to convince the compiler of this due to the union type for SnapshotImportRow value.
    ['price', 'units', 'value'].forEach((field) => (oldData[field] = newData[field].toString())); // Use user-provided precision if everything adds up.
  } else {
    if (newUnits != parseFloat(oldData.units)) {
      if (newPrice != parseFloat(oldData.price)) {
        if (newValue != parseFloat(oldData.value)) {
          // all changed.
          if (newPrice != 0)
            options.push([
              ['units', (newValue * 100) / newPrice],
              ['price', newPrice],
              ['value', newValue]
            ]);
          if (newUnits != 0)
            options.push([
              ['units', newUnits],
              ['price', (newValue / newUnits) * 100],
              ['value', newValue]
            ]);
          if (newUnits != 0)
            options.push([
              ['units', newUnits],
              ['price', newPrice],
              ['value', (newValue / newUnits) * 100]
            ]);
        } else {
          // units and price have changed
          oldData.price = newPrice.toFixed(numDP(oldData.price));
          oldData.units = newUnits.toFixed(numDP(oldData.units));
          oldData.value = ((newPrice * newUnits) / 100).toFixed(numDP(oldData.value));
        }
      } else if (newValue != parseFloat(oldData.value)) {
        // units and value have changed
        if (newUnits == 0) {
          options.push([
            ['units', 0],
            ['price', newPrice],
            ['value', 0]
          ]);
          const oldUnits = parseFloat(oldData.units);
          if (newPrice != 0 && oldUnits != 0)
            options.push([
              ['units', (newValue * 100) / newPrice],
              ['price', (newValue / oldUnits) * 100],
              ['value', newValue]
            ]);
        } else {
          oldData.value = newValue.toFixed(numDP(oldData.value));
          oldData.units = newUnits.toFixed(numDP(oldData.units));
          oldData.price = ((newValue / newUnits) * 100).toFixed(numDP(oldData.price));
        }
      } else {
        // only units have changed
        options.push([
          ['units', newUnits],
          ['price', newPrice],
          ['value', (newPrice * newUnits) / 100]
        ]);
        if (newUnits != 0)
          options.push([
            ['units', newUnits],
            ['price', (newValue / newUnits) * 100],
            ['value', newValue]
          ]);
      }
    } else if (newPrice != parseFloat(oldData.price)) {
      if (newValue != parseFloat(oldData.value)) {
        // price and value have changed
        if (newPrice == 0) {
          options.push([
            ['price', 0],
            ['value', 0],
            ['units', parseFloat(oldData.units)]
          ]);
        } else {
          oldData.value = newValue.toFixed(numDP(oldData.value));
          oldData.price = newPrice.toFixed(numDP(oldData.price));
          oldData.units = ((newValue * 100) / newPrice).toFixed(numDP(oldData.units));
        }
      } else {
        // only price has changed
        options.push([
          ['price', newPrice],
          ['units', newUnits],
          ['value', (newPrice * newUnits) / 100]
        ]);
        if (newPrice != 0)
          options.push([
            ['price', newPrice],
            ['units', (newValue * 100) / newPrice],
            ['value', newValue]
          ]);
      }
    } else if (newValue != parseFloat(oldData.value)) {
      // only value has changed
      if (newUnits != 0)
        options.push([
          ['value', newValue],
          ['units', newUnits],
          ['price', (newValue / newUnits) * 100]
        ]);
      if (newPrice != 0)
        options.push([
          ['value', newValue],
          ['units', (newValue * 100) / newPrice],
          ['price', newPrice]
        ]);
    }
  }
  return [oldData, options];
}
