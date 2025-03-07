"use client";
import * as React from "react";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import ModeToggle from "@/components/color-toggle";
import styles from "@/styles/Root.module.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [showMenu, setShowMenu] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component mounts before rendering theme-dependent content
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => setShowMenu(!showMenu);

  if (!mounted) {
    return (
      <main>
        <div>
          <nav className="relative">
            <div className="flex p-10 items-center justify-between font-bold">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center">
                  <Image src="/logo.svg" alt="Healix Logo" width={35} height={35} className="mr-[0.8px]" />
                  <h1 className="text-xl">ealix</h1>
                </Link>
              </div>
              <div className={`flex flex-col gap-1 transition-all ease-in-out duration-300 ${styles.menu}`}>
                <div className={`w-8 h-1 bg-black ${styles.menuli}`}></div>
                <div className={`w-8 h-1 bg-black ${styles.menuli}`}></div>
                <div className={`w-8 h-1 bg-black ${styles.menuli}`}></div>
              </div>
              <div className={`flex gap-8 items-center ${styles.menubar}`}>
                <ul className="flex gap-5">
                  <li><Link href="/Home" className={styles.a}>Home</Link></li>
                  <li><Link href="/Chat" className={styles.a}>Council</Link></li>
                </ul>
                <UserButton />
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  <Link href="/Contact">Contact Us</Link>
                </button>
              </div>
            </div>
          </nav>
          {children}
        </div>
      </main>
    );
  }

  return (
    <main>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <div className={`${showMenu ? "overflow-hidden h-screen" : "relative min-h-screen bg-gray-100 dark:bg-gray-900"}`}>
          {/* Navbar */}
          <nav className="relative z-20">
            <div className="flex p-10 items-center justify-between font-bold">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center">
                  <Image src="/logo.svg" alt="Healix Logo" width={35} height={35} className="mr-[0.8px]" />
                  <h1 className="text-xl">ealix</h1>
                </Link>
              </div>

              <div
                className={`flex flex-col gap-1 transition-all ease-in-out duration-300 ${styles.menu} ${showMenu ? styles.click : ""}`}
                onClick={toggleMenu}
              >
                <div className={`w-8 h-1 bg-black ${styles.menuli}`}></div>
                <div className={`w-8 h-1 bg-black ${styles.menuli}`}></div>
                <div className={`w-8 h-1 bg-black ${styles.menuli}`}></div>
              </div>

              <div className={`flex gap-8 items-center ${styles.menubar} ${showMenu ? styles.click : ""}`}>
                <ul className="flex gap-5">
                  <li><Link href="/Home" className={styles.a}>Home</Link></li>
                  <li><Link href="/Chat" className={styles.a}>Council</Link></li>
                </ul>
                <UserButton />
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  <Link href="/Contact">Contact Us</Link>
                </button>
              </div>
            </div>
          </nav>

          {/* ModeToggle and Content */}
          {!showMenu && (
            <>
              <div className="absolute top-21 right-10 z-20">
                <ModeToggle />
              </div>
              <div className="relative z-10 min-h-[calc(100vh-96px)]">{children}</div>
            </>
          )}
        </div>
      </ThemeProvider>
    </main>
  );
}
