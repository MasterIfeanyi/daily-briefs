import { Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});


export const metadata = {
  title: "Daily Briefing",
  description:
    "Start your day informed with Daily Briefing — your personalized morning news summary powered by the latest AI technology. Stay ahead every single day.",
  metadataBase: new URL("https://ifeanyi-brief.netlify.app"),

  openGraph: {
    title: "Daily Briefing",
    description:
      "Start your day informed with Daily Briefing — your personalized morning news summary powered by the latest AI technology. Stay ahead every single day.",
    url: "https://ifeanyi-brief.netlify.app",
    siteName: "Daily Briefing",
    images: [
      {
        url: "https://ifeanyi-brief.netlify.app/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Daily Briefing logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Daily Briefing",
    description:
      "Start your day informed with Daily Briefing — your personalized morning news summary powered by the latest AI technology. Stay ahead every single day.",
    images: ["https://ifeanyi-brief.netlify.app/images/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${nunito.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
