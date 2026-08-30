import { Inter } from "next/font/google";
import "@/app/globals.css"; // Ensure standard globals

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Webmail",
  description: "Webmail Client",
};

export default function MailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-gray-50 flex ${inter.className}`}>
      {/* Mail Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-gray-200 font-bold text-lg text-blue-600">
          Webmail
        </div>
        <div className="p-4">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors mb-6">
            Compose
          </button>
          <nav className="space-y-1">
            <a href="#" className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-md">
              <span className="font-medium">Inbox</span>
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              <span className="font-medium">Sent</span>
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              <span className="font-medium">Drafts</span>
            </a>
            <a href="#" className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              <span className="font-medium">Trash</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {children}
      </main>
    </div>
  );
}
