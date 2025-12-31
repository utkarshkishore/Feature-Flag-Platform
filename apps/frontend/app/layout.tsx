import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '../components/auth';

export const metadata: Metadata = {
  title: 'Feature Flag Platform',
  description: 'Manage flags across environments with confidence',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
