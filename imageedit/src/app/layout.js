import './globals.css';
import GrainOverlay from '@/components/GrainOverlay';
import HUD from '@/components/HUD';

export const metadata = {
  title: 'FLUX IMGEN | Zero-Gravity Visual Processing Lab',
  description: 'Escape the Gravity of Design. High-end experimental image processing.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <GrainOverlay />
        <HUD />
        {children}
      </body>
    </html>
  );
}
