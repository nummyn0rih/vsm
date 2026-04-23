export const VEGETABLE_COLORS: Record<string, string> = {
  'Огурец': '#52c41a',
  'Огурцы': '#52c41a',
  'Черри': '#f5222d',
  'Халапеньо': '#135200',
  'Патиссон': '#fadb14',
};

const FALLBACK_PALETTE = [
  '#1677ff',
  '#722ed1',
  '#fa8c16',
  '#13c2c2',
  '#eb2f96',
  '#a0d911',
  '#8c8c8c',
  '#2f54eb',
];

export function buildVegetableColorScale(vegetables: string[]): {
  domain: string[];
  range: string[];
} {
  const names = Array.from(new Set(vegetables)).sort((a, b) =>
    a.localeCompare(b, 'ru'),
  );
  let fallbackIdx = 0;
  const range = names.map((name) => {
    if (VEGETABLE_COLORS[name]) return VEGETABLE_COLORS[name];
    const color = FALLBACK_PALETTE[fallbackIdx % FALLBACK_PALETTE.length];
    fallbackIdx++;
    return color;
  });
  return { domain: names, range };
}
