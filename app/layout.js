import { ReactScan } from "@/lib/react-scan";
import { funnelSans } from "@/app/fonts";
import { Toaster } from "sonner";
import "@/app/globals.css";

export const metadata = {
  title: "Better Converter - Convert Image formats",
  icons: {
    icon: "/favicon-modified.png",
    shortcut: "/favicon-modified.png",
  },
  description:
    "Convert images to any format with our easy-to-use online converter.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ReactScan />
      <body className={`${funnelSans.variable} antialiased bg-neutral-950`}>
        {children}
        <Toaster
          position="top-right"
          richColors={true}
          duration={4000}
          theme="dark"
        />
      </body>
    </html>
  );
}
