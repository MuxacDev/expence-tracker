import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from '@/app';
import '@/app/styles/globals.css';

export const metadata: Metadata = {
  title: 'Expense Tracker',
  description: 'Трекер расходов',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
