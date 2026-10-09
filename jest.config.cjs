module.exports = {
  testEnvironment: "jsdom",
  transform: { "^.+\\.[jt]sx?$": "babel-jest" },
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.js"],
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  clearMocks: true,
  collectCoverageFrom: [
    "src/components/MovieCard.jsx",
    "src/components/MovieDetail.jsx",
    "src/components/SeatSelection.jsx",
    "src/components/BookingSummary.jsx",
    "src/components/Payment.jsx",
    "src/hooks/useMovies.js",
    "src/hooks/useBooking.js",
    "!src/**/*.test.*"
  ]
};
