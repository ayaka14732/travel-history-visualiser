/**
 * Country/location color palette
 * Each location gets a consistent color derived from its name hash.
 */

type LocationColor = { bg: string; text: string; border: string };

// Curated palette of muted, distinguishable colors
const PALETTE: LocationColor[] = [
  { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' }, // blue
  { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' }, // green
  { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' }, // amber
  { bg: '#FCE7F3', text: '#9D174D', border: '#F9A8D4' }, // pink
  { bg: '#EDE9FE', text: '#4C1D95', border: '#C4B5FD' }, // violet
  { bg: '#CCFBF1', text: '#134E4A', border: '#5EEAD4' }, // teal
  { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' }, // red
  { bg: '#E0F2FE', text: '#0C4A6E', border: '#7DD3FC' }, // sky
  { bg: '#F0FDF4', text: '#14532D', border: '#86EFAC' }, // lime
  { bg: '#FFF7ED', text: '#7C2D12', border: '#FDBA74' }, // orange
  { bg: '#F5F3FF', text: '#3730A3', border: '#A5B4FC' }, // indigo
  { bg: '#ECFDF5', text: '#064E3B', border: '#34D399' }, // emerald
  { bg: '#FDF4FF', text: '#701A75', border: '#E879F9' }, // fuchsia
  { bg: '#F0F9FF', text: '#0C4A6E', border: '#38BDF8' }, // light blue
  { bg: '#FEFCE8', text: '#713F12', border: '#FDE047' }, // yellow
  { bg: '#FFF1F2', text: '#881337', border: '#FDA4AF' }, // rose
];

export function getLocationColor(location: string): LocationColor {
  let h = 0;
  for (let i = 0; i < location.length; i++) {
    h = (Math.imul(31, h) + location.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(h) % PALETTE.length];
}
