
// ==========================================
// CINEREVIEW - GOOGLE SHEETS CONNECTION
// ==========================================

// Your deployed Google Apps Script Web App URL
const API_URL = "https://script.google.com/macros/s/AKfycbyz4TaveMcCvglJ-I0Gq-g56Oh13szcEaAVNbCgk8gKU7s4YqoyZxNC70r-njMGk7pO/exec";

// Movie and review data
let movies = [];
let currentUser = JSON.parse(localStorage.getItem("cineReviewUser") || "null");
let authToken = localStorage.getItem("cineReviewToken") || "";

// HTML elements
const movieContainer = document.getElementById("movieContainer");
const movieSelect = document.getElementById("movieSelect");
const reviewForm = document.getElementById("reviewForm");
const submittedReviews = document.getElementById("submittedReviews");

// Emoji ratings
const ratingEmojis = {
    5: "🤩",
    4: "😍",
    3: "😊",
    2: "😐",
    1: "😞"
};

// ==========================================
// API CONNECTION
// ==========================================

async function apiRequest(action, details = {}) {
    const formData = new URLSearchParams();

    formData.append("action", action);

    Object.entries(details).forEach(([key, value]) => {
        formData.append(key, value);
    });

    const response = await fetch(API_URL, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        throw new Error("Server returned an error: " + response.status);
    }

    return await response.json();
}

// ==========================================
// MOVIES
// ==========================================

function displayMovies(movieList) {
    movieContainer.innerHTML = "";

    if (!movieList.length) {
        movieContainer.textContent = "No movies found. Add movies to your Google Sheets Movies tab.";
        return;
    }

    movieList.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";

        const poster = document.createElement("img");
        poster.src = movie.poster || "";
        poster.alt = movie.title + " poster";
        poster.onerror = function () {
            this.alt = "Poster unavailable";
        };

        const info = document.createElement("div");
        info.className = "movie-info";

        const title = document.createElement("h3");
        title.textContent = movie.title;

        const details = document.createElement("p");
        details.textContent = `${movie.genre || "Genre not specified"} | ${movie.year || "Year unknown"}`;

        const button = document.createElement("button");
        button.textContent = "Write Review";
        button.addEventListener("click", () => selectMovie(movie.id));

        info.append(title, details, button);
        card.append(poster, info);
        movieContainer.appendChild(card);
    });
}

function populateMovieSelect() {
    movieSelect.innerHTML = '<option value="">Choose a movie</option>';

    movies.forEach(movie => {
        const option = document.createElement("option");
        option.value = movie.id;
        option.textContent = movie.title;
        movieSelect.appendChild(option);
    });
}

function selectMovie(movieId) {
    movieSelect.value = String(movieId);

    document.getElementById("reviews").scrollIntoView({
        behavior: "smooth"
    });
}

async function loadMovies() {
    try {
        const result = await apiRequest("getMovies");

        if (!result.success) {
            throw new Error(result.message || "Unable to load movies.");
        }

        movies = result.movies || [];

        displayMovies(movies);
        populateMovieSelect();

    } catch (error) {
        console.error("Movie loading error:", error);
        movieContainer.textContent =
            "Unable to load movies from Google Sheets. Please check your connection and try again.";
    }
}

// ==========================================
// MOVIE SEARCH
// ==========================================

document.getElementById("searchInput").addEventListener("input", function () {
    const searchValue = this.value.toLowerCase().trim();

    const filteredMovies = movies.filter(movie =>
        (movie.title || "").toLowerCase().includes(searchValue) ||
        (movie.genre || "").toLowerCase().includes(searchValue)
    );

    displayMovies(filteredMovies);
});

// ==========================================
// LOGIN AND REGISTRATION WINDOWS
// ==========================================

function openLogin() {
    document.getElementById("registerSection").hidden = true;
    document.getElementById("loginSection").hidden = false;

    document.getElementById("loginSection").scrollIntoView({
        behavior: "smooth"
    });
}

function openRegister() {
    document.getElementById("loginSection").hidden = true;
    document.getElementById("registerSection").hidden = false;

    document.getElementById("registerSection").scrollIntoView({
        behavior: "smooth"
    });
}

function closeAuth() {
    document.getElementById("loginSection").hidden = true;
    document.getElementById("registerSection").hidden = true;
}

function switchToRegister(event) {
    event.preventDefault();
    openRegister();
}

function switchToLogin(event) {
    event.preventDefault();
    openLogin();
}

// ==========================================
// USER DISPLAY
// ==========================================

function updateUserDisplay() {
    const reviewerName = document.getElementById("reviewerName");

    if (currentUser) {
        reviewerName.value = currentUser.name || currentUser.fullName || "";
        reviewerName.readOnly = true;
    } else {
        reviewerName.value = "";
        reviewerName.readOnly = false;
    }
}

function logout() {
    localStorage.removeItem("cineReviewUser");
    localStorage.removeItem("cineReviewToken");

    currentUser = null;
    authToken = "";

    updateUserDisplay();
    alert("You have logged out.");
}

// ==========================================
// REGISTRATION
// ==========================================

document.getElementById("registerForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password.length < 8) {
        alert("Password must contain at least 8 characters.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const result = await apiRequest("register", {
            name: name,
            email: email,
            password: password
        });

        if (!result.success) {
            alert(result.message || "Registration failed.");
            return;
        }

        alert("Registration successful! You can now log in.");

        this.reset();
        closeAuth();
        openLogin();

        document.getElementById("loginEmail").value = email;

    } catch (error) {
        console.error("Registration error:", error);
        alert("Could not connect to Google Sheets. Check your internet connection and Apps Script deployment.");
    }
});

// ==========================================
// LOGIN
// ==========================================

document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {
        const result = await apiRequest("login", {
            email: email,
            password: password
        });

        if (!result.success) {
            alert(result.message || "Invalid email or password.");
            return;
        }

        if (!result.token || !result.user) {
            alert("Login response is missing account information. Please check the Apps Script code.");
            return;
        }

        authToken = result.token;
        currentUser = result.user;

        localStorage.setItem("cineReviewToken", authToken);
        localStorage.setItem("cineReviewUser", JSON.stringify(currentUser));

        updateUserDisplay();
        closeAuth();
        this.reset();

        alert("Welcome to CineReview, " + (currentUser.name || currentUser.fullName || "User") + "!");

        loadReviews();

    } catch (error) {
        console.error("Login error:", error);
        alert("Could not connect to Google Sheets. Check your internet connection and Apps Script deployment.");
    }
});

// ==========================================
// SUBMIT REVIEW
// ==========================================

reviewForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!currentUser || !authToken) {
        alert("Please log in before submitting a review.");
        openLogin();
        return;
    }

    const movieId = movieSelect.value;
    const rating = document.getElementById("rating").value;
    const reviewText = document.getElementById("reviewText").value.trim();

    if (!movieId || !rating || !reviewText) {
        alert("Please complete all review fields.");
        return;
    }

    try {
        const result = await apiRequest("submitReview", {
            token: authToken,
            movieId: movieId,
            rating: rating,
            review: reviewText
        });

        if (!result.success) {
            alert(result.message || "Review submission failed.");
            return;
        }

        alert("Your review has been saved successfully!");

        this.reset();
        updateUserDisplay();

        await loadReviews();

    } catch (error) {
        console.error("Review submission error:", error);
        alert("Could not submit your review. Please check your connection and try again.");
    }
});

// ==========================================
// LOAD REVIEWS FROM GOOGLE SHEETS
// ==========================================

async function loadReviews() {
    try {
        const result = await apiRequest("getReviews");

        if (!result.success) {
            throw new Error(result.message || "Unable to load reviews.");
        }

        const reviews = result.reviews || [];

        // Keep the Recent Reviews heading
        submittedReviews.innerHTML = "<h3>Recent Reviews</h3>";

        if (!reviews.length) {
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent = "No reviews yet. Be the first to share your opinion!";
            submittedReviews.appendChild(emptyMessage);
            return;
        }

        reviews.slice().reverse().forEach(review => {
            const movie = movies.find(item =>
                String(item.id) === String(review.movieId)
            );

            const reviewCard = document.createElement("div");
            reviewCard.className = "review-card";

            const heading = document.createElement("h4");
            heading.textContent =
                `${currentUser && String(currentUser.id) === String(review.userId)
                    ? (currentUser.name || currentUser.fullName)
                    : "CineReview Member"} - ${movie ? movie.title : "Movie"}`;

            const rating = document.createElement("p");
            rating.textContent = ratingEmojis[Number(review.rating)] || "😊";

            const content = document.createElement("p");
            content.textContent = review.review || "";

            const date = document.createElement("small");
            date.textContent = review.createdAt
                ? new Date(review.createdAt).toLocaleDateString()
                : "";

            reviewCard.append(heading, rating, content, date);
            submittedReviews.appendChild(reviewCard);
        });

    } catch (error) {
        console.error("Review loading error:", error);

        submittedReviews.innerHTML = "<h3>Recent Reviews</h3>";

        const message = document.createElement("p");
        message.textContent = "Unable to load reviews from Google Sheets.";
        submittedReviews.appendChild(message);
    }
}

// ==========================================
// INITIALIZE CINEREVIEW
// ==========================================

async function initializeCineReview() {
    updateUserDisplay();

    await loadMovies();
    await loadReviews();
}

initializeCineReview();
