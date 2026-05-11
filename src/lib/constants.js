// EQUIPMENT_POLICIES
// Shared across the UI, PDF contracts, and email templates.
export const EQUIPMENT_POLICIES = [
  {
    title: "Reservation Rules",
    rules: [
      "Equipment must be picked up during business hours (10 AM - 3 PM)",
      "Valid student ID required for pickup",
      "Equipment must be returned in the same condition",
    ],
  },
  {
    title: "Late Return Policy",
    content: "Late returns may result in reservation restrictions. Please contact the Digital Media Department if you need to extend your reservation.",
  },
  {
    title: "Damage Responsibility",
    content: "Students are responsible for any damage or loss of equipment during the reservation period. Please report any issues immediately.",
  },
];

export const APP_CONFIG = {
  name: "EU Equipment Management",
  location: "DM Checkout",
  supportEmail: "support@elmhurst.edu",
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};
