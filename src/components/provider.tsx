"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { MotionConfig } from "motion/react";
import { isSiteContent, type SiteContent } from "@/lib/content";
const Context = createContext<{
  content: SiteContent;
  mode: string;
  publish: (c: SiteContent) => void;
}>({} as never);
export function SiteProvider({
  children,
  initial,
  mode,
}: {
  children: ReactNode;
  initial: SiteContent;
  mode: string;
}) {
  const [content, setContent] = useState(initial);
  useEffect(() => {
    if (mode === "preview") {
      try {
        const saved = JSON.parse(
          localStorage.getItem("mingles-published") || "null",
        );
        if (isSiteContent(saved)) setContent(saved);
      } catch {}
    }
  }, [mode]);
  const publish = (c: SiteContent) => {
    setContent(c);
    if (mode === "preview")
      localStorage.setItem("mingles-published", JSON.stringify(c));
  };
  return (
    <Context.Provider value={{ content, mode, publish }}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </Context.Provider>
  );
}
export const useSite = () => useContext(Context);
