"use client";

import { useState } from "react";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    // Validate name field for registration
    if (isRegister && !form.name.trim()) {
      newErrors.name = "Name is required.";
    }

    // Validate email field
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format.";
    }

    // Validate password field
    if (!form.password.trim()) {
      newErrors.password = "Password is required.";
    }

    // Update error state
    setErrors(newErrors);

    // If no validation errors, proceed to submit
    if (Object.keys(newErrors).length === 0) {
      console.log("✅ Formulaire prêt à être envoyé !", form);
      try {
        const endpoint = isRegister ? "/api/register" : "/api/login";

        const res = await fetch(`http://localhost:5000${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok) {
          // Handle API-level errors
          throw new Error(data.error || "An unexpected error occurred.");
        }

        console.log("✅ Auth success:", data);

        // Save JWT token (can be used for authenticated requests)
        localStorage.setItem("token", data.token);

        // Optional: redirect to dashboard after login or registration
        window.location.href = "/dashboard";
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#fdfdfb] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          {isRegister ? "Créer un compte" : "Se connecter à AutoJob"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jean Dupont"
                className={`w-full px-4 py-2 border ${
                  errors.name ? "border-red-400" : "border-gray-300"
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300`}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Adresse e-mail
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@example.com"
              className={`w-full px-4 py-2 border ${
                errors.email ? "border-red-400" : "border-gray-300"
              } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300`}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-4 py-2 border ${
                errors.password ? "border-red-400" : "border-gray-300"
              } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300`}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-xl transition"
          >
            {isRegister ? "Créer mon compte" : "Se connecter"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          {isRegister ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
          <button
            type="button"
            onClick={() => {
              setErrors({});
              setIsRegister(!isRegister);
            }}
            className="text-blue-600 hover:underline font-medium"
          >
            {isRegister ? "Connexion" : "Créer un compte"}
          </button>
        </p>
      </div>
    </div>
  );
}
