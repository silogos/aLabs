import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "../styles.css";
import "@pmin/editor/editor.css";

export const metadata: Metadata = {
  title: "aLabs · Atlas Platform 2.0",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
