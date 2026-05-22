/**
 * Demo brand tokens. Designer should own these once the brand sprint kicks off.
 * High-contrast palette chosen to read in IG stories.
 */
export const theme = {
  color: {
    bg: '#0B0B0F',
    bgElevated: '#16161D',
    text: '#F5F2EA',
    textDim: '#8E8B82',
    accent: '#E8FF4F', // signature electric lime — instantly spottable
    accentInk: '#0B0B0F',
    border: '#22222B',
    danger: '#FF5C5C',
  },
  radius: { sm: 8, md: 14, lg: 20, xl: 28 },
  space: (n: number) => n * 4,
  font: {
    display: 'System',
    body: 'System',
  },
};
