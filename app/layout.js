import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";

const outfit = Outfit({ subsets: ['latin'], weight: ["300", "400", "500", "600", "700"] });

export const metadata = {
  title: {
    default: "QuickCart | Modern E-Commerce Experience",
    template: "%s | QuickCart"
  },
  description: "QuickCart offers a wide range of products at competitive prices. Shop electronics, fashion, home goods and more with fast shipping and secure payment options.",
  keywords: ["ecommerce", "online shopping", "electronics", "fashion", "QuickCart"],
  authors: [{ name: "QuickCart" }],
  creator: "QuickCart",
  publisher: "QuickCart",
  metadataBase: new URL("https://full-stack-e-commerce-app-seven.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "QuickCart | Modern E-Commerce Experience",
    description: "Shop the latest products at great prices with fast shipping and easy returns.",
    url: "https://full-stack-e-commerce-app-seven.vercel.app",
    siteName: "QuickCart",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickCart | Modern E-Commerce Experience",
    description: "Shop the latest products at great prices with fast shipping and easy returns.",
    creator: "@quickcart",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <meta name="theme-color" content="#ffffff" />
        </head>
        <body className={`${outfit.className} antialiased text-gray-700`}>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <AppContextProvider>{children}</AppContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
