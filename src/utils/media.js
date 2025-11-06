const RAW  = process.env.REACT_APP_API_URL || "";
const BASE = RAW.replace(/\/+$/, "");

export const imgUrl = (val) => {
  if (!val) return "";
  // si l’API te renvoie déjà image_url absolu, renvoie-le tel quel
  if (/^https?:\/\//i.test(val)) return val;
  // sinon, c’est souvent "/images/xxx.jpg" => préfixe BASE
  if (val.startsWith("/")) return `${BASE}${val}`;
  return `${BASE}/${val}`;
};
