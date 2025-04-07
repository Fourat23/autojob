"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, UserCircle, Rocket } from "lucide-react";
import { getToken } from "@/lib/auth";

// Interface for user profile
interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

// Interface for CV data
interface CV {
  filename: string;
  uploadedAt: string;
}

// Interface for application data
interface Application {
  id: number;
  title: string;
  location: string;
  status: string;
  applied_at: string;
}

export default function DashboardPage() {
  const router = useRouter();

  // Function to handle logout
  // "Logout" button removes the JWT from localStorage and redirects the user.
  // This ensures the session is terminated client-side in a stateless JWT architecture.
  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");

    // Redirect to login page
    router.push("/login");
  };

  const [user, setUser] = useState<User | null>(null);
  const [cv, setCv] = useState<CV | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user profile and dashboard data
  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Fetch profile
        const profileRes = await fetch("http://localhost:5000/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.ok) {
          router.push("/login");
          return;
        }

        const profileData = await profileRes.json();
        setUser(profileData.user);

        // Fetch dashboard info (CV + recent applications)
        const dashRes = await fetch("http://localhost:5000/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (dashRes.ok) {
          const dashboardData = await dashRes.json();
          setCv(dashboardData.cv);
          setApplications(dashboardData.applications);
        } else {
          console.warn("Failed to fetch dashboard data");
        }
      } catch (err) {
        console.error("❌ Error loading dashboard", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-600">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-2xl">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
            AJ
          </div>
          AutoJob
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <UserCircle size={20} />
          <span className="text-sm">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="ml-3 text-sm text-red-500 hover:underline"
          >
            Se déconnecter
          </button>
        </div>
      </header>

      {/* Main Section */}
      <main className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          👋 Bienvenue {user?.name}
        </h1>
        <p className="text-gray-600 mb-8">
          Voici un aperçu de votre tableau de bord AutoJob.
        </p>

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow p-6 border border-gray-200 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <LayoutDashboard size={20} /> Activité
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {applications.length} candidatures envoyées
            </p>
            <ul className="mt-3 text-sm text-gray-700 space-y-1">
              {applications.slice(0, 5).map((app) => (
                <li key={app.id}>
                  {app.title} – {app.location} · {app.status}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 border border-gray-200 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Rocket size={20} /> Suggestions
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Pas encore de suggestions
            </p>
          </div>
        </div>

        {/* CV section */}
        {cv && (
          <section className="bg-white border border-gray-200 rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              📄 Mon CV
            </h2>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <p className="text-gray-700 font-medium">{cv.filename}</p>
                <p className="text-sm text-gray-500">
                  Déposé le{" "}
                  {new Date(cv.uploadedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-3">
                <a
                  href={`http://localhost:5000/uploads/${cv.filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 border border-blue-600 rounded-xl px-4 py-1.5 hover:bg-blue-50 transition"
                >
                  Voir
                </a>
                <button className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-xl hover:bg-blue-700 transition">
                  Mettre à jour
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-4 border-t border-gray-200 mt-12">
        © {new Date().getFullYear()} AutoJob. Tous droits réservés.
      </footer>
    </div>
  );
}
