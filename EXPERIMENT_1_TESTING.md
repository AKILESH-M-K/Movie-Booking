# Experiment 1 — Test Movie Booking Components

## Topics
Component testing, Jest, React Testing Library, search/filter testing, seat selection, price calculation, and booking confirmation.

## Test coverage added
- `src/__tests__/MovieCard.test.jsx` — movie information, ticket price, and View Movie callback.
- `src/__tests__/MovieDetail.test.jsx` — movie details and Back/Choose Theatre callbacks.
- `src/__tests__/useMovies.test.jsx` — async movie loading, title search, genre filtering, and error state.
- `src/__tests__/SeatSelection.test.jsx` — selecting/removing a selected seat through the existing toggle action, booked-seat disabling, and continue validation.
- `src/__tests__/useBooking.test.jsx` — selected seat count, premium surcharge, convenience fee, total calculation, and seat toggle behaviour.
- `src/__tests__/Payment.test.jsx` — booking confirmation, invalid UPI validation, and confirmation failure handling.

## Run the tests
Run these commands from the project root:

```bash
npm install
npm test
```

For a coverage report:

```bash
npm run test:coverage
```

The test command uses Jest in serial mode for easier local execution. React Testing Library renders components and interacts with them through accessible labels and buttons.

## Notes
- Existing CineBook UI, Redux store, hooks, and backend logic are retained; tests mock network/hook dependencies where appropriate.
- `npm install` is required after adding the testing dependencies so `package-lock.json` can be synchronized.
- Tests need to be run locally before claiming they all pass. This environment could not finish dependency installation, so no passing test result is claimed yet.
