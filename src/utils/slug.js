export function toSlug(s = "") {
  return s
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function fromSlug(slug = "", candidates = []) {
  // try exact, then loose match ignoring accents/case
  const clean = (t) =>
    t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const target = clean(slug.replace(/-/g, " "));
  return (
    candidates.find((b) => clean(b) === target) ||
    candidates.find((b) => clean(b).includes(target)) ||
    slug
  );
}
