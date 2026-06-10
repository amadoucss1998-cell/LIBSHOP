import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import MessageNotifications from '@/components/MessageNotifications';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'theonline18 — Buy & sell near you',
  description: 'Buy and sell second-hand items near you in Liberia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F5F5F5]`}>
        <TopBar />
        <MessageNotifications />
        <main className="min-h-screen pb-20 pt-[104px]">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
