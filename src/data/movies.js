const movies = [
  {
    id: 101,
    title: "Interstellar",
    genre: "Sci-Fi",
    rating: 4.8,
    duration: "2h 49m",
    price: 250,
    language: "English",
    cast: "Matthew McConaughey, Anne Hathaway",
    description:
      "A team of explorers travels through a wormhole in space in search of a new home for humanity.",
    image: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  },

  {
    id: 102,
    title: "Inception",
    genre: "Sci-Fi",
    rating: 4.7,
    duration: "2h 28m",
    price: 220,
    language: "English",
    cast: "Leonardo DiCaprio, Joseph Gordon-Levitt",
    description:
      "A skilled extractor who steals secrets through dreams is given a chance to erase his past.",
    image: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  },

  {
    id: 103,
    title: "Avengers: Endgame",
    genre: "Action",
    rating: 4.6,
    duration: "3h 1m",
    price: 280,
    language: "English",
    cast: "Robert Downey Jr., Chris Evans, Scarlett Johansson",
    description:
      "The Avengers assemble once again for their final battle against Thanos.",
    image: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
  },

  {
    id: 104,
    title: "Leo",
    genre: "Action",
    rating: 4.5,
    duration: "2h 44m",
    price: 200,
    language: "Tamil",
    cast: "Vijay, Trisha, Sanjay Dutt",
    description:
      "A quiet café owner is forced to confront a violent past when dangerous people recognize him.",
    image:
      "https://m.media-amazon.com/images/M/MV5BMTg5OGRhNmItODNiMi00MTZhLWFjYmUtYWNiM2RiNjIwMzZkXkEyXkFqcGc%40._V1_.jpg",
  },

  {
    id: 105,
    title: "Vikram",
    genre: "Action",
    rating: 4.7,
    duration: "2h 54m",
    price: 230,
    language: "Tamil",
    cast: "Kamal Haasan, Vijay Sethupathi, Fahadh Faasil",
    description:
      "A black-ops team investigates a series of murders connected to a dangerous drug syndicate.",
    image: "https://image.tmdb.org/t/p/w500/dS4N7TB4hkjHINMaLUGOqSHVhPe.jpg",
  },

  {
    id: 106,
    title: "Dune: Part Two",
    genre: "Adventure",
    rating: 4.6,
    duration: "2h 46m",
    price: 260,
    language: "English",
    cast: "Timothée Chalamet, Zendaya, Rebecca Ferguson",
    description:
      "Paul Atreides joins the Fremen and begins his journey toward revenge and a greater destiny.",
    image: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
  },

  {
    id: 107,
    title: "The Dark Knight",
    genre: "Action",
    rating: 4.9,
    duration: "2h 32m",
    price: 240,
    language: "English",
    cast: "Christian Bale, Heath Ledger, Aaron Eckhart",
    description:
      "Batman faces a criminal mastermind who plunges Gotham City into chaos.",
    image: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  },

  {
    id: 108,
    title: "Oppenheimer",
    genre: "Drama",
    rating: 4.7,
    duration: "3h 0m",
    price: 270,
    language: "English",
    cast: "Cillian Murphy, Emily Blunt, Robert Downey Jr.",
    description:
      "The story of J. Robert Oppenheimer and the development of the first atomic bomb.",
    image: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
  },

  {
    id: 109,
    title: "Avatar: The Way of Water",
    genre: "Adventure",
    rating: 4.6,
    duration: "3h 12m",
    price: 300,
    language: "English",
    cast: "Sam Worthington, Zoe Saldana, Sigourney Weaver",
    description:
      "Jake Sully and his family seek refuge with the ocean-dwelling Metkayina clan of Pandora.",
    image: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
  },

  {
    id: 110,
    title: "Spider-Man: No Way Home",
    genre: "Action",
    rating: 4.6,
    duration: "2h 28m",
    price: 250,
    language: "English",
    cast: "Tom Holland, Zendaya, Benedict Cumberbatch",
    description:
      "Spider-Man's identity is revealed, leading him to face dangerous villains from other worlds.",
    image: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
  },

  {
    id: 111,
    title: "Joker",
    genre: "Drama",
    rating: 4.6,
    duration: "2h 2m",
    price: 220,
    language: "English",
    cast: "Joaquin Phoenix, Robert De Niro, Zazie Beetz",
    description:
      "A troubled man gradually transforms into the infamous criminal known as the Joker.",
    image: "https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
  },

  {
    id: 112,
    title: "Top Gun: Maverick",
    genre: "Action",
    rating: 4.7,
    duration: "2h 11m",
    price: 260,
    language: "English",
    cast: "Tom Cruise, Miles Teller, Jennifer Connelly",
    description:
      "Maverick returns to train a new generation of elite pilots for a dangerous mission.",
    image: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
  },

  {
    id: 113,
    title: "Parasite",
    genre: "Thriller",
    rating: 4.8,
    duration: "2h 12m",
    price: 210,
    language: "Korean",
    cast: "Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong",
    description:
      "A struggling family slowly enters the lives of a wealthy household with unexpected consequences.",
    image: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
  },

  {
    id: 114,
    title: "Whiplash",
    genre: "Drama",
    rating: 4.7,
    duration: "1h 46m",
    price: 190,
    language: "English",
    cast: "Miles Teller, J.K. Simmons, Paul Reiser",
    description:
      "An ambitious young drummer enters an intense relationship with a demanding music instructor.",
    image: "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
  },

  {
    id: 115,
    title: "Gladiator",
    genre: "Action",
    rating: 4.8,
    duration: "2h 35m",
    price: 230,
    language: "English",
    cast: "Russell Crowe, Joaquin Phoenix, Connie Nielsen",
    description:
      "A betrayed Roman general fights his way back through the gladiatorial arena for revenge.",
    image: "https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
  },

  {
    id: 116,
    title: "Avengers: Infinity War",
    genre: "Action",
    rating: 4.7,
    duration: "2h 29m",
    price: 270,
    language: "English",
    cast: "Robert Downey Jr., Chris Hemsworth, Chris Evans",
    description:
      "The Avengers and their allies attempt to stop Thanos from collecting the Infinity Stones.",
    image: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
  },

  {
    id: 117,
    title: "The Godfather",
    genre: "Drama",
    rating: 4.9,
    duration: "2h 55m",
    price: 200,
    language: "English",
    cast: "Marlon Brando, Al Pacino, James Caan",
    description:
      "The aging patriarch of a powerful crime family prepares his son to take over the family business.",
    image: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
  },

  {
    id: 118,
    title: "Forrest Gump",
    genre: "Drama",
    rating: 4.8,
    duration: "2h 22m",
    price: 190,
    language: "English",
    cast: "Tom Hanks, Robin Wright, Gary Sinise",
    description:
      "A kind-hearted man experiences several extraordinary moments throughout American history.",
    image: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
  },

  {
    id: 119,
    title: "Pulp Fiction",
    genre: "Thriller",
    rating: 4.8,
    duration: "2h 34m",
    price: 210,
    language: "English",
    cast: "John Travolta, Samuel L. Jackson, Uma Thurman",
    description:
      "Several interconnected stories of criminals unfold across the streets of Los Angeles.",
    image: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
  },

  {
    id: 120,
    title: "The Shawshank Redemption",
    genre: "Drama",
    rating: 4.9,
    duration: "2h 22m",
    price: 200,
    language: "English",
    cast: "Tim Robbins, Morgan Freeman, Bob Gunton",
    description:
      "A banker sentenced to prison forms an enduring friendship while holding onto hope for freedom.",
    image: "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
  },

  {
    id: 121,
    title: "The Matrix",
    genre: "Sci-Fi",
    rating: 4.8,
    duration: "2h 16m",
    price: 220,
    language: "English",
    cast: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
    description:
      "A computer hacker discovers that reality is a simulation and joins a rebellion against its controllers.",
    image: "/Movie-Booking/posters/matrix.webp",
  },

  {
    id: 122,
    title: "Barbie",
    genre: "Comedy",
    rating: 4.4,
    duration: "1h 54m",
    price: 240,
    language: "English",
    cast: "Margot Robbie, Ryan Gosling, America Ferrera",
    description:
      "Barbie and Ken leave their picture-perfect world and discover what life is like in the real world.",
    image: "/Movie-Booking/posters/barbie.webp",
  },

  {
    id: 123,
    title: "Coco",
    genre: "Animation",
    rating: 4.8,
    duration: "1h 45m",
    price: 190,
    language: "English",
    cast: "Anthony Gonzalez, Gael García Bernal, Benjamin Bratt",
    description:
      "Young Miguel journeys to the Land of the Dead to uncover his family's history and follow his love of music.",
    image: "/Movie-Booking/posters/coco.webp",
  },

  {
    id: 124,
    title: "The Batman",
    genre: "Action",
    rating: 4.5,
    duration: "2h 56m",
    price: 250,
    language: "English",
    cast: "Robert Pattinson, Zoë Kravitz, Paul Dano",
    description:
      "A young Batman investigates a trail of clues that exposes corruption in Gotham City.",
    image: "/Movie-Booking/posters/the-batman.webp",
  },

  {
    id: 125,
    title: "La La Land",
    genre: "Romance",
    rating: 4.5,
    duration: "2h 8m",
    price: 210,
    language: "English",
    cast: "Ryan Gosling, Emma Stone, John Legend",
    description:
      "An aspiring actor and a jazz musician fall in love while pursuing their dreams in Los Angeles.",
    image: "/Movie-Booking/posters/la-la-land.webp",
  },

  {
    id: 126,
    title: "RRR",
    genre: "Action",
    rating: 4.7,
    duration: "3h 7m",
    price: 240,
    language: "Telugu",
    cast: "N. T. Rama Rao Jr., Ram Charan, Alia Bhatt",
    description:
      "Two legendary revolutionaries form an extraordinary friendship while fighting colonial rule in India.",
    image: "/Movie-Booking/posters/rrr.webp",
  },
];

export default movies;
