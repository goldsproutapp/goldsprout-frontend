export function divergingColourScale(min: number, max: number): (num: number) => string {
  const lowerHue = 0;
  const upperHue = 100;
  const range = max - min;
  let offset = 0;
  if (max < 0) offset = max;
  if (min > 0) offset = min;
  return (num: number) => {
    const pos = (num - min) / range;
    let hue = Math.floor(lowerHue + pos * (upperHue - lowerHue));
    if (num > max) hue = upperHue;
    if (num < min) hue = lowerHue;
    return `hsl(${hue},50%,50%)`;
  };
}
