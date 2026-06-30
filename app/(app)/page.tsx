import { redirect } from 'next/navigation';

// The app opens on the Data view (lap-data intake).
export default function Index() {
  redirect('/data');
}
