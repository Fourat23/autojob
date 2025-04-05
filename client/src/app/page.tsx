"use client";
import { FileText, Briefcase } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex justify-between items-center bg-white shadow-sm">
        <div className="flex items-center gap-2 text-blue-600 font-extrabold text-2xl">
          <div className="w-8 h-8 bg-blue-600 text-white font-bold flex items-center justify-center rounded-full">
            AJ
          </div>
          AutoJob
        </div>
        <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
          <a href="#" className="hover:text-blue-600 transition">
            Accueil
          </a>
          <a href="#" className="hover:text-blue-600 transition">
            Offres
          </a>
          <a href="/login" className="hover:text-blue-600 transition">
            Connexion
          </a>
        </nav>
      </header>

      {/* Main Section */}
      <main className="flex-grow w-full px-6 py-16 flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">
          Automatise ta recherche{" "}
          <span className="text-blue-600">d'emploi</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl">
          AutoJob te connecte en un clic aux bonnes opportunités. Publie ton CV
          ou ton offre, et laisse notre système intelligent faire le travail.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-full shadow-md transition">
            <FileText size={20} /> Poster un CV
          </button>
          <button className="flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium px-6 py-3 rounded-full transition">
            <Briefcase size={20} /> Publier une offre
          </button>
        </div>

        <section className="w-full max-w-5xl">
          <h2 className="text-3xl font-semibold text-gray-800 mb-8">
            Offres récentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow hover:shadow-lg transition">
              <h3 className="text-lg font-semibold text-gray-900">
                Développeur React – Paris
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                CDI · Full remote · 45k€
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow hover:shadow-lg transition">
              <h3 className="text-lg font-semibold text-gray-900">
                UX Designer – Lyon
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Freelance · 3 mois renouvelables
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-sm text-gray-500 border-t border-gray-200">
        © {new Date().getFullYear()} AutoJob. Tous droits réservés.
      </footer>
    </div>
  );
}
