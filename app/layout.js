import { AppContextProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Outfit, Ovo } from "next/font/google";

// Configure the fonts
const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
});

const ovo = Ovo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ovo",
  weight: "400",
});

export const metadata = {
  title: {
    default: "EzCart | Modern E-Commerce Experience",
    template: "%s | EzCart"
  },
  metadataBase: new URL("https://ezcart.com"),
  description: "EzCart offers a wide range of products at competitive prices. Shop electronics, fashion, home goods and more with fast shipping and secure payment options.",
  keywords: ["ecommerce", "online shopping", "electronics", "fashion", "EzCart"],
  authors: [{ name: "EzCart" }],
  creator: "EzCart",
  publisher: "EzCart",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ezcart.com",
    title: "EzCart | Modern E-Commerce Experience",
    description: "Shop the latest electronics, fashion, and more at competitive prices.",
    siteName: "EzCart",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EzCart | Modern E-Commerce Experience",
    description: "Shop the latest electronics, fashion, and more at competitive prices.",
    creator: "@ezcart",
    images: ["/twitter-image.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`dark ${outfit.variable} ${ovo.variable}`}>
        <body className="font-outfit">
          <AppContextProvider>
            <ThemeProvider>
              {children}
              <Toaster position="top-center" />
            </ThemeProvider>
          </AppContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
