function contains<V>(obj: { [key: string]: V }, value: string): boolean {
  return Object.keys(obj).includes(value);
}

export function requiredFields(extended: boolean = false, forDisplay: boolean = false): string[] {
  return [
    'stock_name',
    'value',
    'cost',
    ...(extended ? ['user', 'provider', 'account', 'date'] : []),
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
  [key: string]: string | number;
}): [{ [key: string]: string | number }, string | null] {
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

  return [obj, null];
}
