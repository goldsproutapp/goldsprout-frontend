const DEFAULT_SCHEME = 400;

function vars(scheme: number): { cssvar: (v: string) => string; c: (v: string) => string } {
  const style = window.getComputedStyle(document.documentElement);
  const cssvar = (v: string) => style.getPropertyValue(`--${v}`);
  const c = (v: string) => cssvar(`${v}-${scheme}`);
  return {
    cssvar,
    c
  };
}

export function backgroundColours(scheme: number = DEFAULT_SCHEME): string[] {
  const { c } = vars(scheme);
  return [
    c('blue'),
    c('red'),
    c('teal'),
    c('orange'),
    c('purple'),
    c('cyan'),
    c('yellow'),
    c('bluegray'),
    c('green'),
    c('indigo'),
    c('gray')
  ];
}

export function gridColour(): string {
  return vars(200).c('surface');
}
