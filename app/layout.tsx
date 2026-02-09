import "./globals.css";

export const metadata = {
  title: "CBT Tracker",
  description: "Track your cognitive behavioral therapy thought records",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
