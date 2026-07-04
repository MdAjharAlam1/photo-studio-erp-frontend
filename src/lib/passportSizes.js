// mm dimensions for popular passport sizes
export const PASSPORT_SIZES = [
  { id: "in-passport", label: "India Passport (35×45mm)", w: 35, h: 45 },
  { id: "us-passport", label: "US Passport (2×2 in)", w: 51, h: 51 },
  { id: "uk-passport", label: "UK Passport (35×45mm)", w: 35, h: 45 },
  { id: "schengen-visa", label: "Schengen Visa (35×45mm)", w: 35, h: 45 },
  { id: "in-visa", label: "India Visa (50×50mm)", w: 50, h: 50 },
  { id: "in-stamp", label: "Stamp Size (20×25mm)", w: 20, h: 25 },
  { id: "passport-half", label: "Passport Half (25×35mm)", w: 25, h: 35 },
  { id: "custom", label: "Custom Size", w: 35, h: 45, custom: true },
];

export const PAPER_SIZES = [
  { id: "4x6", label: "4×6 in", w: 152.4, h: 101.6 },   // landscape mm
  { id: "5x7", label: "5×7 in", w: 177.8, h: 127 },
  { id: "a4", label: "A4", w: 210, h: 297 },
  { id: "a5", label: "A5", w: 148, h: 210 },
  { id: "letter", label: "Letter", w: 215.9, h: 279.4 },
];
