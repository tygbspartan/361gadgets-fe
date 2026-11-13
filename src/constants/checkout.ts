/*
 * Address rules. The server enforces the same ones (361-be
 * src/constants/nepal.constants.ts); change both together.
 */

// Districts that get the inside-valley shipping rate.
export const VALLEY_DISTRICTS = ["Kathmandu", "Lalitpur", "Bhaktapur"];

// Nepali mobile: 10 digits starting with 97 or 98. Spaces, dashes and a
// +977 / 977 prefix are allowed in the input and stripped by the server.
export const normalizeNepalPhone = (value: string) =>
  value.replace(/[\s\-()]/g, "").replace(/^\+?977/, "");
export const NEPAL_MOBILE_REGEX = /^9[78]\d{8}$/;

export const NEPAL_POSTAL_REGEX = /^\d{5}$/;

export const NEPAL_PROVINCES = [
  "Koshi Province",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
];

export const NEPAL_DISTRICTS = [
  "Achham",
  "Arghakhanchi",
  "Baglung",
  "Baitadi",
  "Bajhang",
  "Bajura",
  "Banke",
  "Bara",
  "Bardiya",
  "Bhaktapur",
  "Bhojpur",
  "Chitwan",
  "Dadeldhura",
  "Dailekh",
  "Dang",
  "Darchula",
  "Dhading",
  "Dhankuta",
  "Dhanusha",
  "Dolakha",
  "Dolpa",
  "Doti",
  "Gorkha",
  "Gulmi",
  "Humla",
  "Ilam",
  "Jajarkot",
  "Jhapa",
  "Jumla",
  "Kailali",
  "Kalikot",
  "Kanchanpur",
  "Kapilvastu",
  "Kaski",
  "Kathmandu",
  "Kavrepalanchok",
  "Khotang",
  "Lalitpur",
  "Lamjung",
  "Mahottari",
  "Makwanpur",
  "Manang",
  "Morang",
  "Mugu",
  "Mustang",
  "Myagdi",
  "Nawalparasi",
  "Nawalpur",
  "Nuwakot",
  "Okhaldhunga",
  "Palpa",
  "Panchthar",
  "Parbat",
  "Parsa",
  "Pyuthan",
  "Ramechhap",
  "Rasuwa",
  "Rautahat",
  "Rolpa",
  "Rukum East",
  "Rukum West",
  "Rupandehi",
  "Salyan",
  "Sankhuwasabha",
  "Saptari",
  "Sarlahi",
  "Sindhuli",
  "Sindhupalchok",
  "Siraha",
  "Solukhumbu",
  "Sunsari",
  "Surkhet",
  "Syangja",
  "Tanahu",
  "Taplejung",
  "Terhathum",
  "Udayapur",
];

// Fallback shipping values, used only until the live platform settings load
// (and if that request fails). Must mirror the backend PlatformSettings defaults.
export const SHIPPING_COSTS = {
  INSIDE_VALLEY: 100,
  OUTSIDE_VALLEY: 200,
  FREE_SHIPPING_THRESHOLD: 10000,
};

export const PAYMENT_METHODS = {
  COD: "cod",
  QR: "esewa", // eSewa QR; the server has no separate "qr" method
} as const;

export const ESEWA_QR_CODE = "/qr.jpg";
