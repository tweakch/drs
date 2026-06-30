// The nine views from the prototype, in tab order. Shared by the nav and the
// route segments under app/(app)/. Keys match the route folder names.
export interface ViewDef {
  key: string;
  label: string;
  href: string;
}

export const VIEWS: ViewDef[] = [
  { key: 'data', label: 'Data', href: '/data' },
  { key: 'director', label: 'Director', href: '/director' },
  { key: 'product', label: 'Product', href: '/product' },
  { key: 'race', label: 'Race', href: '/race' },
  { key: 'team', label: 'Team', href: '/team' },
  { key: 'driver', label: 'Driver', href: '/driver' },
  { key: 'kart', label: 'Kart', href: '/kart' },
  { key: 'detektiv', label: 'Detektiv', href: '/detektiv' },
  { key: 'replay', label: 'Replay', href: '/replay' },
];
