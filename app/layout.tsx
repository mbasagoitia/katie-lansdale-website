import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Inter, Roboto } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";
import Banner from "@/components/ui/banner/banner";
import Navigation from "@/components/ui/navigation/navigation";
import Footer from "@/components/ui/footer/footer";
import PageTransition, { TransitionOverlay } from "@/components/ui/page-transition/PageTransition";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-cormorant" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Katie Lansdale Violinist",
  description: "Official website for Katie Lansdale, violinist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${cormorant.variable} ${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Banner />
        <PageTransition>
          <div className={styles.pageWrapper}>
            <main className={styles.contentCard}>
              <Navigation />
              <TransitionOverlay>{children}</TransitionOverlay>
              <Footer />
            </main>
          </div>
        </PageTransition>
      </body>
    </html>
  );
}