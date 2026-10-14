import './globals.css';
export const metadata = {
  title: 'DamDekho – Electronics price comparison in Bangladesh',
  description: 'Compare phone, laptop and gadget prices across Bangladesh stores, with warranty type and last-updated time.',
};
export default function RootLayout({ children }) {
  return (<html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body>{children}</body></html>);
}
