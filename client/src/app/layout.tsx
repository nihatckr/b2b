import { LayoutProvider } from "../components/Layout/LayoutProvider";
import { ConditionalNavbar } from "../components/Navigation/ConditionalNavbar";
import { AuthProvider } from "../context/AuthProvider";

import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LayoutProvider>
          <AuthProvider>
            <ConditionalNavbar />
            {children}
          </AuthProvider>
        </LayoutProvider>
      </body>
    </html>
  );
}
