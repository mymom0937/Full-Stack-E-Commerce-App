import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { AppContextProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'EzCart | Modern Tech Store',
  description: 'Discover the latest gadgets and electronics.',
  icons: {
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
              <main className="pt-8 md:pt-12 lg:pt-16">
                {children}
              </main>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'var(--card-bg)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    fontSize: '1rem',
                    fontWeight: 500,
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
