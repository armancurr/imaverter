import { funnelSans, geistMono } from "@/app/fonts";
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
      <body
        className={`${funnelSans.variable} ${geistMono.variable} antialiased bg-gradient-to-t from-neutral-900 to-neutral-950 text-neutral-200`}
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
