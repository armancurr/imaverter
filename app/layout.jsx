import { ReactScan } from "@/lib/react-scan";
import { ibmPlexSans, ibmPlexMono } from "@/app/fonts";
import "@/app/globals.css";

export const metadata = {
  title: "Better Converter - Convert Images formats",
  description:
    "Convert images to any format with our easy-to-use online converter.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ReactScan />
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased bg-neutral-950`}
      >
        {children}
      </body>
    </html>
  );
}
