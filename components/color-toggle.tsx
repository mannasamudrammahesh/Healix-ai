"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

export default function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const buttonVariants = {
    light: { rotate: 0, scale: 1 },
    dark: { rotate: 180, scale: 1.1 },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0, rotate: -90 },
    visible: { opacity: 1, scale: 1, rotate: 0 },
    exit: { opacity: 0, scale: 0, rotate: 90 },
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="icon">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  return (
    <motion.div
      initial="light"
      animate={theme === "dark" ? "dark" : "light"}
      variants={buttonVariants}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="relative overflow-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-10 h-10"
        aria-label="Toggle theme"
      >
        <motion.div
          key="sun"
          initial="hidden"
          animate={theme !== "dark" ? "visible" : "hidden"}
          exit="exit"
          variants={iconVariants}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
        </motion.div>
        <motion.div
          key="moon"
          initial="hidden"
          animate={theme === "dark" ? "visible" : "hidden"}
          exit="exit"
          variants={iconVariants}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          <Moon className="h-[1.2rem] w-[1.2rem] text-blue-500" />
        </motion.div>
      </Button>
    </motion.div>
  );
}
