const API_KEY = 'YOUR_TMDB_API_KEY'; // Brevin: added BASE_URL because it was throwing an error when running
const BASE_URL = 'https://api.themoviedb.org/3/';
const TRENDING_MOVIES_URL = `${BASE_URL}trending/movie/week?api_key=${API_KEY}`;
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const STORAGE_KEY = 'filmflix_watchlist_v3';
const movieGrid = document.getElementById('movie-grid');
let currentStatusFilter = 'all';

// Sample movies (including La La Land & Interstellar) so the grid loads even without an API key
const SAMPLE_MOVIES = [
  {
    id: 'tt3783958',
    title: 'La La Land',
    category: 'Movie',
    genre: 'Drama',
    directorCast: 'Damien Chazelle, Ryan Gosling, Emma Stone',
    year: 2016,
    status: 'watched',
    rating: 5,
    poster: 'https://m.media-amazon.com/images/M/MV5BMzUzNDM2NzM2MV5BMl5BanBnXkFtZTgwNTM3NTg4OTE@._V1_SX300.jpg'
  },
  {
    id: 'tt0816692',
    title: 'Interstellar',
    category: 'Movie',
    genre: 'Sci-Fi',
    directorCast: 'Christopher Nolan, Matthew McConaughey, Anne Hathaway',
    year: 2014,
    status: 'watched',
    rating: 5,
    poster: 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_SX300.jpg'
  },
  {
    id: 'tt1375666',
    title: 'Inception',
    category: 'Movie',
    genre: 'Sci-Fi',
    directorCast: 'Christopher Nolan, Leonardo DiCaprio',
    year: 2010,
    status: 'watched',
    rating: 5,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg'
  },
  {
    id: 'tt0111161',
    title: 'The Shawshank Redemption',
    category: 'Movie',
    genre: 'Drama',
    directorCast: 'Frank Darabont, Tim Robbins',
    year: 1994,
    status: 'watched',
    rating: 5,
    poster: 'https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_SX300.jpg'
  },
  {
    id: 'tt0468569',
    title: 'The Dark Knight',
    category: 'Movie',
    genre: 'Action',
    directorCast: 'Christopher Nolan, Christian Bale',
    year: 2008,
    status: 'want-to-watch',
    rating: 0,
    poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg'
  },
  {
    id: 'tt4633694',
    title: 'Spider-Man: Into the Spider-Verse',
    category: 'Movie',
    genre: 'Action',
    directorCast: 'Bob Persichetti, Shameik Moore',
    year: 2018,
    status: 'want-to-watch',
    rating: 0,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjMwNDkxMTgzOF5BMl5BanBnXkFtZTgwNTkwNTQ3NjM@._V1_SX300.jpg'
  },
  {
    id: 'tt5052448',
    title: 'Get Out',
    category: 'Movie',
    genre: 'Horror',
    directorCast: 'Jordan Peele, Daniel Kaluuya',
    year: 2017,
    status: 'want-to-watch',
    rating: 0,
    poster: 'https://m.media-amazon.com/images/M/MV5BMjUxMDQwNjcyNl5BMl5BanBnXkFtZTgwNzcwMzc0MTI@._V1_SX300.jpg'
  }
];

// Load saved watchlist from localStorage, or start with SAMPLE_MOVIES
let movies = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [...SAMPLE_MOVIES];

function saveMovies() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}

// Fetch from TMDB if a real API key is added, otherwise render local/sample watchlist
async function getMovies() {
  if (!API_KEY || API_KEY === 'YOUR_TMDB_API_KEY') {
    saveMovies();
    displayMovies(movies);
    return;
  }

  try {
    const response = await fetch(TRENDING_MOVIES_URL);
    if (!response.ok) throw new Error('Invalid API response');
    const data = await response.json();

    // Map TMDB results into our watchlist object format
    const apiMovies = data.results.slice(0, 8).map((m) => ({
      id: String(m.id),
      title: m.title,
      category: 'Movie',
      genre: 'Action',
      directorCast: 'Trending on TMDB',
      year: m.release_date ? m.release_date.slice(0, 4) : '2026',
      status: 'want-to-watch',
      rating: Math.round((m.vote_average || 0) / 2),
      poster: m.poster_path ? `${IMAGE_URL}${m.poster_path}` : ''
    }));

    if (!localStorage.getItem(STORAGE_KEY)) {
      movies = [...SAMPLE_MOVIES, ...apiMovies];
      saveMovies();
    }
    displayMovies(movies);
  } catch (error) {
    console.error('Error fetching data from movie API:', error);
    // Graceful fallback so the page never shows a broken error message
    displayMovies(movies);
  }
}

// Render filtered movie cards in the grid
function displayMovies(movieList) {
  if (!movieGrid) return;
  movieGrid.innerHTML = '';

  const genreSelect = document.getElementById('genreFilter');
  const selectedGenre = genreSelect ? genreSelect.value : 'all';

  const filtered = movieList.filter((movie) => {
    const matchesStatus = currentStatusFilter === 'all' || movie.status === currentStatusFilter;
    const matchesGenre =
      selectedGenre === 'all' ||
      (movie.genre && movie.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
    return matchesStatus && matchesGenre;
  });

  if (filtered.length === 0) {
    movieGrid.innerHTML = `<p style="color: #a1a1aa; grid-column: 1 / -1;">No movies match your current filter.</p>`;
    return;
  }

  filtered.forEach((movie) => {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');

    const fallbackPoster = `https://placehold.co/300x450/18181c/ffffff?text=${encodeURIComponent(movie.title)}`;
    const posterPath = movie.poster && movie.poster.trim() !== '' ? movie.poster : fallbackPoster;

    // Interactive 1-5 star rating HTML
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      starsHtml += `<span class="star ${i <= movie.rating ? 'filled' : ''}" onclick="rateMovie('${movie.id}', ${i})">&#9733;</span>`;
    }

    movieCard.innerHTML = `
      <img src="${posterPath}" alt="${movie.title}" class="movie-poster" onerror="this.src='${fallbackPoster}'">
      <div class="movie-card-body">
        <h3>${movie.title}</h3>
        <p>${movie.year} &bull; ${movie.genre} (${movie.category})</p>
        <p>${movie.directorCast}</p>
        <p>Status: <strong>${movie.status === 'watched' ? 'Watched' : 'Want to Watch'}</strong></p>
        <div class="stars">${starsHtml}</div>
        <button onclick="toggleStatus('${movie.id}')">
          ${movie.status === 'watched' ? 'Move to Want to Watch' : 'Mark as Watched'}
        </button>
      </div>
    `;

    movieGrid.appendChild(movieCard);
  });
}

// Toggle between "want-to-watch" and "watched"
window.toggleStatus = function (id) {
  const target = movies.find((m) => m.id === id);
  if (target) {
    target.status = target.status === 'watched' ? 'want-to-watch' : 'watched';
    saveMovies();
    displayMovies(movies);
  }
};

// Rate a movie 1-5 stars
window.rateMovie = function (id, stars) {
  const target = movies.find((m) => m.id === id);
  if (target) {
    target.rating = stars;
    target.status = 'watched';
    saveMovies();
    displayMovies(movies);
  }
};

//Brevin: fixed the add to watchlist button
window.quickAddMovie = function (title, genre, directorCast, year, poster) {
  const exists = movies.some((m) => m.title.toLowerCase() === title.toLowerCase());
  if (exists) {
    alert(`${title} is already in your watchlist!`);
    return;
  }
  movies.unshift({
    id: 'movie_' + Date.now(),
    title,
    category: 'Movie',
    genre,
    directorCast,
    year,
    status: 'want-to-watch',
    rating: 0,
    poster
  });
  saveMovies();
  displayMovies(movies);
};

// Status Filter Tabs ("All Movies", "Want to Watch", "Watched")
document.querySelectorAll('.filter-tab').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    currentStatusFilter = button.dataset.status;
    displayMovies(movies);
  });
});

// Genre Dropdown Filter
const genreFilterEl = document.getElementById('genreFilter');
if (genreFilterEl) {
  genreFilterEl.addEventListener('change', () => displayMovies(movies));
}

// "Add to Watchlist" Form Submission
const movieForm = document.getElementById('movieForm');
if (movieForm) {
  movieForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const posterInput = document.getElementById('posterUrl');

    const newMovie = {
      id: 'movie_' + Date.now(),
      title: document.getElementById('movieId').value.trim(),
      category: document.getElementById('category').value,
      genre: document.getElementById('genre').value.trim(),
      directorCast: document.getElementById('directorCast').value.trim(),
      year: document.getElementById('year').value,
      status: 'want-to-watch',
      rating: 0,
      poster: posterInput ? posterInput.value.trim() : ''
    };

    movies.unshift(newMovie);
    saveMovies();
    displayMovies(movies);
    e.target.reset();
  });
}

// Initialize on page load
getMovies();