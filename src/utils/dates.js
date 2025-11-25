// src/utils/dates.js

// Formate une date ISO en heure du Maroc (Africa/Casablanca)
export function formatOrderDate(isoString) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);

    return new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Africa/Casablanca", // 👈 très important
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(d);
  } catch (e) {
    // secours au cas où
    return new Date(isoString).toLocaleString("fr-FR");
  }
}
