import "./globals.css";
import Footer from "../components/Footer";

export const metadata = { title: "SMARTPARK" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-100 text-zinc-900 antialiased">
        <div className="flex min-h-screen flex-col"> 
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
