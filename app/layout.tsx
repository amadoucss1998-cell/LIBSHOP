import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import MessageNotifications from '@/components/MessageNotifications';
import AuthHashHandler from '@/components/AuthHashHandler';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The Online 18 — Your last stop to buying & selling second hand items',
  description: 'Your last stop to buying and selling second hand items.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#F5F5F5]`}>
        <AuthHashHandler />
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
