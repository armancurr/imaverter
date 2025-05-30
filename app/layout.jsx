import "@/app/globals.css";
import { ibmPlexSans, ibmPlexMono } from "@/app/fonts";

export const metadata = {
  title: "Converter - Convert Images formats",
  description:
    "Convert images to any format with our easy-to-use online converter.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased bg-neutral-50`}
      >
        {children}
      </body>
    </html>
  );
}
