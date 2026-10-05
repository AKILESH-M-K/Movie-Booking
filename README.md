# CineBook - Movie Ticket Booking Application

React + Vite movie booking application implementing Experiment 1 and Experiment 2.

## Experiment 1 - Movie Booking Application with API Integration

- REST API using JSON Server (`db.json`)
- Fetch API used for movie-list retrieval
- Axios used for dynamic movie details and theatre retrieval
- Async/await API handling
- Reusable `MovieCard` and `MovieList` components
- Search and genre filtering from API data
- Dynamic `/movie/:id` details
- Loading and error states

## Experiment 2 - Movie Booking State Management

- Redux Toolkit global booking store
- `selectedMovie`, `selectedTheatre`, `selectedShow`, and `selectedSeats`
- Redux actions for selecting/removing seats
- Ticket price and total amount derived from global booking state
- Custom Redux middleware logs and persists booking actions
- Booking draft restored from localStorage after refresh
- State shared across MovieList, TheatreList, ShowTiming, SeatSelection, BookingSummary, and Payment

## Run the project

Install dependencies:

```bash
npm install
```

Start the REST API in terminal 1:

```bash
npm run server
```

Start React in terminal 2:

```bash
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Important

Keep JSON Server running on port `4000`, because the application API base URL is:

`http://localhost:4000`
