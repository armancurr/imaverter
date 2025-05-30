import { ReactScan } from "@/lib/react-scan";
import { funnelSans } from "@/app/fonts";
import "@/app/globals.css";

export const metadata = {
  title: "Better Converter - Convert Images formats",
  icons: {
    icon: "/favicon.ico",
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
      </body>
    </html>
  );
}
