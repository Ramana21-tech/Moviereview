
// Sample movie data
const movies = [
    {
        id: 1,
        title: "Interstellar",
        genre: "Sci-Fi",
        year: 2014,
        rating: 4.8,
        poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
    },
    {
        id: 2,
        title: "Inception",
        genre: "Action / Sci-Fi",
        year: 2010,
        rating: 4.7,
        poster: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg"
    },
    {
        id: 3,
        title: "The Dark Knight",
        genre: "Action",
        year: 2008,
        rating: 4.9,
        poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
    },
    {
        id: 4,
        title: "Avatar",
        genre: "Adventure",
        year: 2009,
        rating: 4.5,
        poster: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg"
    }
];

// Display movies
const movieContainer = document.getElementById("movieContainer");
const movieSelect = document.getElementById("movieSelect");

function displayMovies(movieList) {
    movieContainer.innerHTML = "";

    movieList.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";

        card.innerHTML = `
            <img src="${movie.poster}" alt="${movie.title} poster">
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <p>${movie.genre} | ${movie.year}</p>
                <p>⭐ ${movie.rating}/5</p>
                <button onclick="selectMovie(${movie.id})">
                    Write Review
                </button>
            </div>
        `;

        movieContainer.appendChild(card);
    });
}

// Add movies to dropdown
function populateMovieSelect() {
    movies.forEach(movie => {
        const option = document.createElement("option");
        option.value = movie.id;
        option.textContent = movie.title;
        movieSelect.appendChild(option);
    });
}

// Select movie from card
function selectMovie(movieId) {
    movieSelect.value = movieId;
    document.getElementById("reviews").scrollIntoView({
        behavior: "smooth"
    });
}

// Search movies
document.getElementById("searchInput").addEventListener("input", function () {
    const searchValue = this.value.toLowerCase();

    const filteredMovies = movies.filter(movie =>
        movie.title.toLowerCase().includes(searchValue) ||
        movie.genre.toLowerCase().includes(searchValue)
    );

    displayMovies(filteredMovies);
});

// Submit review (temporary frontend version)
document.getElementById("reviewForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("reviewerName").value;
    const movieId = Number(movieSelect.value);
    const rating = document.getElementById("rating").value;
    const reviewText = document.getElementById("reviewText").value;

    const selectedMovie = movies.find(movie => movie.id === movieId);

    const reviewCard = document.createElement("div");
    reviewCard.className = "review-card";

    const heading = document.createElement("h4");
    heading.textContent = `${name} - ${selectedMovie.title}`;

    const stars = document.createElement("p");
    const ratingEmojis = {
    5: "🤩",
    4: "😍",
    3: "😊",
    2: "😐",
    1: "😞"
};

stars.textContent = ratingEmojis[rating];

    const content = document.createElement("p");
    content.textContent = reviewText;

    reviewCard.append(heading, stars, content);
    document.getElementById("submittedReviews").appendChild(reviewCard);

    alert("Your review has been submitted!");

    this.reset();
});

// Initialize
displayMovies(movies);
populateMovieSelect();
