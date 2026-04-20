import type { Metadata } from 'next';
import './globals.css';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata: Metadata = {
  title: 'ERP System',
  description: 'Enterprise Resource Planning System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}