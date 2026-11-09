const API_KEY = 'YOUR_TMDB_API_KEY';
const BASE_URL = 'https://api.themoviedb.org/3/';
const TRENDING_MOVIES_URL = `${BASE_URL}trending/movie/week?api_key=${API_KEY}`;
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

movieGrid = document.getElementById('movie-grid');

async function getMovies() {
    try {
        const response = await fetch(TRENDING_MOVIES_URL);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error('Error fetching data from movie API:', error);
        movieGrid.innerHTML = `<p>Something went wrong. Please try again later.</p>`;
    }
}

function displayMovies(movies) {
    // Clear any existing content
    movieGrid.innerHTML = '';

    movies.forEach(movie => {
        // Create card element
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');

        // Fallback placeholder image if poster_path doesn't exist
        const posterPath = movie.poster_path ? `${IMAGE_URL}${movie.poster_path}` : 'https://placeholder.com';

        movieCard.innerHTML = `
            <img src="${posterPath}" alt="${movie.title}" class="movie-poster">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <span class="rating">${movie.vote_average.toFixed(1)} ⭐</span>
            </div>
        `;

        // Append card to the grid container
        movieGrid.appendChild(movieCard);
    });
}

getMovies();