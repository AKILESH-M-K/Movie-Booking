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
    console.log("🔄 [UPDATE] Updating profile:", { name: cleanName, phone: cleanPhone });

    try {
      const result = await updateProfile({ name: cleanName, phone: cleanPhone });
      if (!result.success) {
        console.error("❌ [UPDATE] Profile update failed:", result.error);
        setProfileError(result.error || "Could not update profile.");
        return;
      }

      console.log("✅ [UPDATE] Profile updated successfully:", { name: cleanName, phone: cleanPhone });
      setProfileMsg("Profile updated successfully!");
    } catch (err) {
      console.error("❌ [UPDATE] Unexpected error:", err);
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
    console.log("📥 [GET] Fetching all movies...");
    try {
      const movies = await fetchMovies();
      console.log("✅ [GET] Movies list:", movies);
      setCrudStatus({
        type: "success",
        text: `GET ✅  Retrieved ${movies.length} movies — see console (F12) for full list.`,
      });
    } catch (err) {
      console.error("❌ [GET] Failed:", err);
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
    console.log("📤 [POST] Adding new movie:", moviePayload);

    try {
      const created = await createMovie(moviePayload);
      console.log("✅ [POST] Movie created:", created);
      setCrudStatus({
        type: "success",
        text: `POST ✅  "${created.title}" added (ID: ${created.id}). See console for details.`,
      });
      setNewTitle("");
      setNewGenre("Action");
      setNewPrice("300");
      setShowAddForm(false);
    } catch (err) {
      console.error("❌ [POST] Failed:", err);
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
    console.log(`🗑️ [DELETE] Deleting movie ID: ${trimmedId}...`);

    try {
      const result = await deleteMovie(trimmedId);
      console.log("✅ [DELETE] Movie deleted:", result);
      setCrudStatus({
        type: "success",
        text: `DELETE ✅  Movie ID ${trimmedId} deleted. See console for details.`,
      });
      setDeleteId("");
      setShowDeleteForm(false);
    } catch (err) {
      console.error("❌ [DELETE] Failed:", err);
      setDeleteError(`Failed to delete movie ID ${trimmedId}. It may not exist.`);
    } finally {
      setCrudLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-150px)] bg-[#f6f8fb] px-5 py-12 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* ─── Profile Update Card (DIV, NO form tag, pure onClick) ─── */}
        <div className="rounded-3xl border border-[#e4e7ec] bg-[#ffffff] p-7 shadow-[0_18px_45px_rgba(82,60,42,0.10)] sm:p-10">
          {/* Header */}
          <div className="flex flex-col gap-5 border-b border-[#efe8d5] pb-7 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#e4572e] text-3xl font-black text-white shadow-lg">
              {(user?.name?.[0] || "U").toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#667085]">My Profile</p>
              <h1 className="mt-1 text-3xl font-black text-[#14213d]">{user?.name}</h1>
              <p className="mt-1 text-[#667085]">{user?.email}</p>
            </div>
          </div>

          {/* Profile fields container - using div to eliminate any chance of browser form submission */}
          <div className="mt-8 space-y-5">
            <div>
              <label htmlFor="profileName" className="mb-1 block text-sm font-bold text-[#344054]">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="profileName"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setProfileError(""); setProfileMsg(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleUpdateProfile(e); } }}
                className="w-full rounded-xl border border-[#d9cfba] bg-[#ffffff] px-4 py-3 text-[#14213d] focus:border-[#e4572e] focus:outline-none focus:ring-2 focus:ring-[#e4572e]/20"
              />
            </div>

            <div>
              <label htmlFor="profileEmail" className="mb-1 block text-sm font-bold text-[#344054]">
                Email Address
              </label>
              <input
                id="profileEmail"
                type="email"
                value={user?.email || ""}
                readOnly
                className="w-full cursor-not-allowed rounded-xl border border-[#d9cfba] bg-[#f5f0e6] px-4 py-3 text-[#667085]"
              />
            </div>

            <div>
              <label htmlFor="profilePhone" className="mb-1 block text-sm font-bold text-[#344054]">
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
                className="w-full rounded-xl border border-[#d9cfba] bg-[#ffffff] px-4 py-3 text-[#14213d] focus:border-[#e4572e] focus:outline-none focus:ring-2 focus:ring-[#e4572e]/20"
              />
            </div>

            {profileMsg && (
              <p className="rounded-xl border border-[#b8e0d2] bg-[#e6f5ef] px-4 py-3 text-sm font-bold text-[#147d61]">
                ✅ {profileMsg}
              </p>
            )}
            {profileError && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                ❌ {profileError}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                disabled={saving}
                onClick={handleUpdateProfile}
                className="rounded-xl bg-[#e4572e] px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#c94423] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Updating…" : "🔄 Update Profile"}
              </button>
              <Link
                to="/bookings"
                className="inline-flex items-center justify-center rounded-xl border border-[#d0d5dd] bg-[#fcf7eb] px-5 py-3 text-sm font-black text-[#344054] transition hover:-translate-y-0.5 hover:bg-[#fff1ed]"
              >
                My Bookings
              </Link>
            </div>
          </div>
        </div>

        {/* ─── Movie CRUD Card (NO <form> elements — all onClick) ─── */}
        <div className="rounded-3xl border border-[#e4e7ec] bg-[#ffffff] p-7 shadow-[0_18px_45px_rgba(82,60,42,0.10)] sm:p-10">
          <div className="border-b border-[#efe8d5] pb-5">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#667085]">CRUD Operations</p>
            <h2 className="mt-1 text-2xl font-black text-[#14213d]">Movie Management</h2>
            <p className="mt-1 text-sm text-[#667085]">
              Results are logged in the browser console (F12 → Console tab).
            </p>
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
            <div className={`mt-4 rounded-xl border px-4 py-3 text-sm font-bold ${
              crudStatus.type === "error"
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