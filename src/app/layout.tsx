import type { Metadata } from "next";
import { Karla } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ScrollToTop } from "../components/scroll-to-top";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Vinicius Martins",
  description: "Vinicius Martins personal website",
};

const karla = Karla({
  subsets: ["latin"],
  weight: "400",
});

const Header = dynamic(() => import("./Header"), { ssr: false });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="min-h-screen" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                  if (theme === 'dark' || (!theme && systemPrefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${karla.className} min-h-full px-6`}>
        <Header />
        <main className="mx-auto max-w-prose pb-4">
          {children}
          <ScrollToTop />
        </main>
        <footer className="mx-auto flex max-w-prose flex-col max-sm:items-start items-center gap-2 py-6 text-sm text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-4">
            <a
              className="decoration-zinc-500 underline-offset-4 transition-transform sm:hover:underline dark:decoration-zinc-400"
              href="https://github.com/Vini-Verse/blog"
              target="_blank"
            >
              Code
            </a>
            <a
              className="decoration-zinc-500 underline-offset-4 transition-transform sm:hover:underline dark:decoration-zinc-400"
              href="https://x.com/ViniVerseDev"
              target="_blank"
            >
              @ViniVerseDev
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
