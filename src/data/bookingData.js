// Theatre, show and seat-layout reference data. Prices are applied per seat
// category; the final amount is always recalculated from this data, never
// trusted from stored state.

export const theatres = [
  { id: 1, name: "PVR INOX", location: "Prozone Mall", city: "Coimbatore", distance: "1.4 km", screens: 8, features: ["Dolby Atmos", "Recliner Seats", "Food Court"] },
  { id: 2, name: "KG Cinemas", location: "Race Course", city: "Coimbatore", distance: "2.1 km", screens: 6, features: ["Dolby Atmos", "Premium Lounge", "Parking"] },
  { id: 3, name: "Fun Republic", location: "Peelamedu", city: "Coimbatore", distance: "3.2 km", screens: 7, features: ["IMAX", "Food Court", "Parking"] },
  { id: 4, name: "Brookefields Cinemas", location: "Brookefields Mall", city: "Coimbatore", distance: "3.8 km", screens: 5, features: ["Dolby Atmos", "Recliner Seats", "Cafe"] },
  { id: 5, name: "Bharath Cinemas", location: "Gandhipuram", city: "Coimbatore", distance: "4.6 km", screens: 4, features: ["Dolby Sound", "Parking", "Snacks"] },
  { id: 6, name: "INOX", location: "Fun Mall", city: "Coimbatore", distance: "5.2 km", screens: 6, features: ["Premium Seats", "Food Court", "Parking"] },
  { id: 7, name: "Sri Murugan Cinemas", location: "Saibaba Colony", city: "Coimbatore", distance: "5.9 km", screens: 3, features: ["Dolby Sound", "Family Seating", "Snacks"] },
  { id: 8, name: "Kalpana Cinemas", location: "RS Puram", city: "Coimbatore", distance: "6.4 km", screens: 4, features: ["Premium Seats", "Parking", "Cafe"] },
  { id: 9, name: "BABA Cinemas", location: "Singanallur", city: "Coimbatore", distance: "7.1 km", screens: 5, features: ["Dolby Atmos", "Food Court", "Parking"] },
  { id: 10, name: "Sri Lakshmi Theatre", location: "Ukkadam", city: "Coimbatore", distance: "8.3 km", screens: 2, features: ["Family Seating", "Snacks", "Parking"] },
];

export const shows = [
  { id: 1, time: "10:00 AM", format: "2D", language: "English" },
  { id: 2, time: "01:30 PM", format: "2D", language: "English" },
  { id: 3, time: "04:30 PM", format: "2D", language: "English" },
  { id: 4, time: "07:30 PM", format: "IMAX", language: "English" },
  { id: 5, time: "10:30 PM", format: "2D", language: "English" },
];

// Seat categories and their surcharge on top of the movie's base price.
export const seatCategories = {
  Premium: { label: "Premium", surcharge: 50 },
  Regular: { label: "Regular", surcharge: 0 },
};

// Single source of truth for the seat map. Rows are listed from the screen
// outward (A is nearest the screen).
export const seatRows = [
  { row: "A", type: "Premium", count: 10 },
  { row: "B", type: "Premium", count: 10 },
  { row: "C", type: "Regular", count: 10 },
  { row: "D", type: "Regular", count: 10 },
  { row: "E", type: "Regular", count: 10 },
  { row: "F", type: "Regular", count: 10 },
];

export const MAX_SEATS_PER_BOOKING = 8;

export const seats = seatRows.flatMap(({ row, type, count }) =>
  Array.from({ length: count }, (_, index) => ({
    id: `${row}${index + 1}`,
    row,
    number: index + 1,
    type,
  })),
);
