import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { AppContextProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'EzCart - Modern E-Commerce Store',
  description: 'Shop the latest tech gadgets, electronics, and more.',
  icons: {
    // icon: '/favicon.ico',
    // icon: '/favicon2.ico',
    icon: '/favicon3.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add Google Fonts Inter classic link */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ClerkProvider>
          <ThemeProvider>
            <AppContextProvider>
              <main>
                {children}
              </main>
              <Toaster
                position="bottom-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#F8BD19',
                      secondary: 'white',
                    },
                  },
                }}
              />
            </AppContextProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
