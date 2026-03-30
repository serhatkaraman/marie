import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marie Meister - Photography",
  description: "Photography portfolio of Marie Meister",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
