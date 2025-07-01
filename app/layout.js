import { ReactScan } from "@/lib/react-scan";
import { funnelSans } from "@/app/fonts";
import { Toaster } from "sonner";
import "@/app/globals.css";

export const metadata = {
  title: "Imaverter - Image Processing Tool",
  icons: {
    icon: "/imaverter.png",
    shortcut: "/imaverter.png",
  },
  description: "Image Processing Tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ReactScan />
      <body
        className={`${funnelSans.variable} antialiased bg-neutral-950 text-neutral-200`}
      >
        {children}
        {/* <Toaster
          position="top-right"
          richColors={true}
          duration={4000}
          theme="light"
        /> */}
      </body>
    </html>
  );
}
