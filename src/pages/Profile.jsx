import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { isValidPhone, sanitizeName, sanitizePhone } from "../utils/validation";
import { fetchMovies, createMovie, deleteMovie } from "../api/movieApi";

function Profile() {
  const { user, updateProfile } = useAuth();

  // ── Profile form state ──
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [saving, setSaving] = useState(false);

  // ── CRUD shared state ──
  const [crudStatus, setCrudStatus] = useState({ type: "", text: "" });
  const [crudLoading, setCrudLoading] = useState(false);

  // ── Add Movie state ──
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newGenre, setNewGenre] = useState("Action");
  const [newPrice, setNewPrice] = useState("300");
  const [addError, setAddError] = useState("");

  // ── Delete Movie state ──
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // ═══════════════════════════════════════════════════════
  // UPDATE — profile update (pure onClick, no form submit)
  // ═══════════════════════════════════════════════════════
  const handleUpdateProfile = async (e) => {
    if (e) {
      if (typeof e.preventDefault === "function") e.preventDefault();
      if (typeof e.stopPropagation === "function") e.stopPropagation();
    }
    setProfileMsg("");
    setProfileError("");

    const cleanName = sanitizeName(name);
    const cleanPhone = sanitizePhone(phone);

    if (cleanName.length < 2) {
      setProfileError("Enter a valid name (at least 2 characters).");
      return;
    }
    if (cleanPhone && !isValidPhone(cleanPhone)) {
      setProfileError("Enter a valid 10-digit phone number.");
      return;
    }

    setSaving(true);

    try {
      const result = await updateProfile({ name: cleanName, phone: cleanPhone });
      if (!result.success) {
        setProfileError(result.error || "Could not update profile.");
        return;
      }
      setProfileMsg("Profile updated successfully!");
    } catch {
      setProfileError("Could not update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ═══════════════════════════════════════════════════════
  // GET — retrieve movies (button click, no form)
  // ═══════════════════════════════════════════════════════
  const handleGetMovies = async () => {
    setCrudLoading(true);
    setCrudStatus({ type: "", text: "" });
    try {
      const movies = await fetchMovies();
      setCrudStatus({
        type: "success",
        text: `GET ✅  Retrieved ${movies.length} movies.`,
      });
    } catch {
      setCrudStatus({ type: "error", text: "GET ❌  Failed. See console for details." });
    } finally {
      setCrudLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════
  // POST — add movie (button click, no form submit)
  // ═══════════════════════════════════════════════════════
  const handleAddMovie = async () => {
    setAddError("");

    if (!newTitle.trim()) {
      setAddError("Movie title is required.");
      return;
    }

    const moviePayload = {
      title: newTitle.trim(),
      genre: newGenre.trim() || "Action",
      rating: 4.5,
      duration: "2h 00m",
      price: Number(newPrice) || 300,
      language: "English",
      cast: "",
      description: "Added from CineBook profile.",
      image: "https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
    };

    setCrudLoading(true);
    setCrudStatus({ type: "", text: "" });

    try {
      const created = await createMovie(moviePayload);
      setCrudStatus({
        type: "success",
        text: `POST ✅  "${created.title}" added (ID: ${created.id}). See console for details.`,
      });
      setNewTitle("");
      setNewGenre("Action");
      setNewPrice("300");
      setShowAddForm(false);
    } catch {
      setAddError("Failed to add movie. Check the console for details.");
    } finally {
      setCrudLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════
  // DELETE — remove movie (button click, no form submit)
  // ═══════════════════════════════════════════════════════
  const handleDeleteMovie = async () => {
    setDeleteError("");

    const trimmedId = deleteId.trim();
    if (!trimmedId) {
      setDeleteError("Please enter a Movie ID.");
      return;
    }

    setCrudLoading(true);
    setCrudStatus({ type: "", text: "" });

    try {
      await deleteMovie(trimmedId);
      setCrudStatus({
        type: "success",
        text: `DELETE ✅  Movie ID ${trimmedId} deleted.`,
      });
      setDeleteId("");
      setShowDeleteForm(false);
    } catch {
      setDeleteError(`Failed to delete movie ID ${trimmedId}. It may not exist.`);
    } finally {
      setCrudLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-150px)] bg-canvas px-5 py-12 font-sans text-ink-primary lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* ─── Profile Update Card ─── */}
        <div className="rounded-2xl border border-canvas-muted bg-surface p-7 shadow-cozy sm:p-10">
          {/* Header */}
          <div className="flex flex-col gap-5 border-b border-canvas-muted pb-7 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand text-3xl font-bold font-sans text-white shadow-cozy">
              {(user?.name?.[0] || "U").toUpperCase()}
            </div>
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-ink-secondary">My Profile</p>
              <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-ink-primary">{user?.name}</h1>
              <p className="mt-1 font-sans text-sm text-ink-secondary">{user?.email}</p>
            </div>
          </div>

          {/* Profile fields container */}
          <div className="mt-8 space-y-5">
            <div>
              <label htmlFor="profileName" className="mb-1 block font-sans text-sm font-medium text-ink-primary">
                Full Name <span className="text-brand">*</span>
              </label>
              <input
                id="profileName"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setProfileError(""); setProfileMsg(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUpdateProfile(e); } }}
                className="w-full rounded-xl border border-canvas-muted bg-surface px-4 py-3 font-sans text-ink-primary placeholder:text-ink-tertiary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
              />
            </div>

            <div>
              <label htmlFor="profileEmail" className="mb-1 block font-sans text-sm font-medium text-ink-primary">
                Email Address
              </label>
              <input
                id="profileEmail"
                type="email"
                value={user?.email || ""}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-canvas-muted bg-canvas/60 px-4 py-3 font-sans text-ink-secondary"
              />
            </div>

            <div>
              <label htmlFor="profilePhone" className="mb-1 block font-sans text-sm font-medium text-ink-primary">
                Phone Number
              </label>
              <input
                id="profilePhone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => { setPhone(sanitizePhone(e.target.value)); setProfileError(""); setProfileMsg(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUpdateProfile(e); } }}
                placeholder="10-digit mobile number"
                className="w-full rounded-xl border border-canvas-muted bg-surface px-4 py-3 font-sans text-ink-primary placeholder:text-ink-tertiary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10"
              />
            </div>

            {profileMsg && (
              <p className="rounded-xl border border-brand/20 bg-brand-light px-4 py-3 font-sans text-sm font-semibold text-brand shadow-cozy">
                ✅ {profileMsg}
              </p>
            )}
            {profileError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm font-semibold text-red-700">
                ❌ {profileError}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                disabled={saving}
                onClick={handleUpdateProfile}
                className="rounded-xl bg-brand px-6 py-3 font-sans text-sm font-semibold text-white shadow-cozy transition hover:bg-brand-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Updating…" : "🔄 Update Profile"}
              </button>
              <Link
                to="/bookings"
                className="inline-flex items-center justify-center rounded-xl border border-canvas-muted bg-surface px-5 py-3 font-sans text-sm font-semibold text-ink-primary shadow-cozy transition hover:bg-canvas active:scale-[0.99]"
              >
                My Bookings
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Movie CRUD Card ─── */}
        <div className="rounded-2xl border border-canvas-muted bg-surface p-7 shadow-cozy sm:p-10">
          <div className="border-b border-canvas-muted pb-5">
            <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-ink-secondary">CRUD Operations</p>
            <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-ink-primary">Movie Management</h2>
            <p className="mt-1 font-sans text-sm text-ink-secondary">
              Results are logged in the browser console (F12 → Console tab).
            </p>
            {user?.role !== "admin" && (
              <p className="mt-2 rounded-xl border border-amber/30 bg-amber/10 px-3 py-2 font-sans text-xs font-bold text-amber">
                ⚠️ Add and Delete require <strong>admin</strong> privileges. GET is available to all users.
              </p>
            )}
          </div>

          {/* Action Buttons row */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={crudLoading}
              onClick={handleGetMovies}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0284c7] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0369a1] disabled:opacity-50"
            >
              📥 Retrieve Movies (GET)
            </button>

            <button
              type="button"
              disabled={crudLoading}
              onClick={() => { setShowAddForm((p) => !p); setShowDeleteForm(false); setAddError(""); setCrudStatus({ type: "", text: "" }); }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#16a34a] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#15803d] disabled:opacity-50"
            >
              ➕ Add Movie (POST)
            </button>

            <button
              type="button"
              disabled={crudLoading}
              onClick={() => { setShowDeleteForm((p) => !p); setShowAddForm(false); setDeleteError(""); setCrudStatus({ type: "", text: "" }); }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#dc2626] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#b91c1c] disabled:opacity-50"
            >
              🗑️ Delete Movie (DELETE)
            </button>
          </div>

          {/* Status banner */}
          {crudStatus.text && (
            <div className={`mt-4 rounded-xl border px-4 py-3 text-sm font-bold ${crudStatus.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-[#b8e0d2] bg-[#e6f5ef] text-[#147d61]"
              }`}>
              {crudStatus.text}
            </div>
          )}

          {/* ── Add Movie Panel (DIV, not a form) ── */}
          {showAddForm && (
            <div className="mt-6 space-y-4 rounded-2xl border border-[#d6f0db] bg-[#f5fcf6] p-6">
              <h3 className="text-base font-black text-[#14213d]">➕ Add New Movie</h3>

              <div>
                <label className="mb-1 block text-sm font-bold text-[#344054]">
                  Movie Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => { setNewTitle(e.target.value); setAddError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddMovie(); } }}
                  placeholder="e.g. Gladiator II"
                  className="w-full rounded-xl border border-[#b4e0bc] bg-white px-4 py-2.5 text-sm text-[#14213d] focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-bold text-[#344054]">Genre</label>
                  <input
                    type="text"
                    value={newGenre}
                    onChange={(e) => { setNewGenre(e.target.value); setAddError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddMovie(); } }}
                    placeholder="Action"
                    className="w-full rounded-xl border border-[#b4e0bc] bg-white px-4 py-2.5 text-sm text-[#14213d] focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-bold text-[#344054]">Price (₹)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => { setNewPrice(e.target.value); setAddError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddMovie(); } }}
                    placeholder="300"
                    min="0"
                    className="w-full rounded-xl border border-[#b4e0bc] bg-white px-4 py-2.5 text-sm text-[#14213d] focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#16a34a]/20"
                  />
                </div>
              </div>

              {addError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                  ❌ {addError}
                </p>
              )}

              <div className="flex gap-3">
                {/* type="button" — never submits a form */}
                <button
                  type="button"
                  disabled={crudLoading}
                  onClick={handleAddMovie}
                  className="rounded-xl bg-[#16a34a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#15803d] disabled:opacity-50"
                >
                  {crudLoading ? "Adding…" : "Add Movie"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setAddError(""); setNewTitle(""); }}
                  className="rounded-xl border border-[#ccc] px-5 py-2.5 text-sm font-bold text-[#344054] hover:bg-[#f5f0e6]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── Delete Movie Panel (DIV, not a form) ── */}
          {showDeleteForm && (
            <div className="mt-6 space-y-4 rounded-2xl border border-[#fcd5d5] bg-[#fff8f8] p-6">
              <h3 className="text-base font-black text-[#14213d]">🗑️ Delete a Movie</h3>

              <div>
                <label className="mb-1 block text-sm font-bold text-[#344054]">
                  Movie ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={deleteId}
                  onChange={(e) => { setDeleteId(e.target.value); setDeleteError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleDeleteMovie(); } }}
                  placeholder="e.g. 101"
                  className="w-full rounded-xl border border-[#f4b8b8] bg-white px-4 py-2.5 text-sm text-[#14213d] focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20"
                />
                <p className="mt-1 text-xs text-[#98a2b3]">
                  Click <strong>Retrieve Movies (GET)</strong> first to see available movie IDs in the console.
                </p>
              </div>

              {deleteError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                  ❌ {deleteError}
                </p>
              )}

              <div className="flex gap-3">
                {/* type="button" — never submits a form */}
                <button
                  type="button"
                  disabled={crudLoading}
                  onClick={handleDeleteMovie}
                  className="rounded-xl bg-[#dc2626] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#b91c1c] disabled:opacity-50"
                >
                  {crudLoading ? "Deleting…" : "Delete Movie"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowDeleteForm(false); setDeleteError(""); setDeleteId(""); }}
                  className="rounded-xl border border-[#ccc] px-5 py-2.5 text-sm font-bold text-[#344054] hover:bg-[#f5f0e6]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

export default Profile;
