// src/app/layout.js

import './globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: 'EU Equipment App',
  description: 'Elmhurst University Media Equipment Management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}