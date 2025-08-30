import { movies, saveMovies } from "./main.js";


let editingIndex = null;
let currentMovieIndex = null;  
let currentRating = 0;

export function createMovieCard(movie, i, showActions = true) {
  return `
    <div class="card h-100 shadow-sm" style="max-width: 280px; margin: auto;">
      <img src="${movie.poster}" class="card-img-top" alt="poster" loading="lazy">
      <div class="card-body p-2 d-flex flex-column">
        <h6 class="card-title text-truncate" title="${movie.title}">
          ${movie.title} (${movie.releaseDate})
        </h6>
        <small class="text-muted">🎬 ${movie.director}</small>
        <small class="text-muted">⏱ ${movie.duration} min</small>
        <div class="mb-2">
          <span class="badge bg-warning text-dark">IMDb: ${movie.ratings || "N/A"}</span>
          <span class="badge bg-info">Sua nota: ${movie.userRating || "-"}</span>
        </div>
        <p><strong>Disponível em:</strong> ${movie.streaming}</p>
        ${
          showActions
            ? `<div class="mt-auto d-flex justify-content-between pt-2 button">
                <button class="btn btn-sm btn-outline-primary" onclick="openRatingModal(${i})">✏️</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteMovie(${i})">❌</button>
               </div>`
            : ""
        }
      </div>
    </div>`;
}

export function renderMovies(list = movies, showActions = true) {
  const container = document.getElementById("moviesList");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<p class="text-center text-muted">Nenhum filme encontrado.</p>`;
    document.getElementById("mediaIMDB").innerHTML = "";
    return;
  }

  list.forEach((movie, i) => {
    const col = document.createElement("div");
    col.className = "col-lg-3 col-md-4 col-sm-6 mb-4";
    col.innerHTML = createMovieCard(movie, i, showActions);
    container.appendChild(col);
  });

  let btn = document.createElement("button");
btn.className = "btn btn-primary";
btn.onclick = () => addMovie(movies);
updateAddButton(btn, movies);


  saveMovies();
  countRatings();
}

export function showMessage(message, type = "danger") {
  const container = document.getElementById("messages");
  container.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}
function updateAddButton(button, movie) {
  if (movies.some(m => m.title === movie.title)) {
    button.disabled = true;
    button.textContent = "Já está na lista";
    button.classList.add("btn-secondary"); 
    button.classList.remove("btn-primary");
  } else {
    button.disabled = false;
    button.textContent = "Adicionar";
    button.classList.add("btn-primary");
    button.classList.remove("btn-secondary");
  }
}

export function countRatings() {
  if (movies.length === 0) {
    document.getElementById("mediaIMDB").innerHTML = "";
    return;
  }
  let ratings = movies.map(m => Number(m.ratings)).filter(r => !isNaN(r));
  if (ratings.length === 0) {
    document.getElementById("mediaIMDB").innerHTML = "Nenhum rating válido encontrado!";
    return;
  }
  let avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  document.getElementById("mediaIMDB").innerHTML = `Média IMDb dos filmes: <strong>${avg.toFixed(2)}</strong>`;
}

export function openRatingModal(i) {
  currentMovieIndex = i;
  let nota = movies[i].userRating || 0;
  currentRating = nota;
  renderStars(nota);

  let modal = new bootstrap.Modal(document.getElementById("ratingModal"));
  modal.show();
}

function renderStars(rating = 0) {
  let container = document.getElementById("starRating");
  container.innerHTML = "";

  for (let i = 1; i <= 5; i++) {
    let leftValue = (i - 1) * 2 + 1; 
    let rightValue = leftValue + 1;  

    let icon = document.createElement("i");
    icon.classList.add("bi");

    if (rating >= rightValue) {
      icon.classList.add("bi-star-fill"); 
    } else if (rating === leftValue) {
      icon.classList.add("bi-star-half"); 
    } else {
      icon.classList.add("bi-star"); 
    }

    icon.style.fontSize = "2rem";
    icon.style.cursor = "pointer";
    icon.style.color = "#f5c518"; 

    icon.addEventListener("click", (e) => {
      let rect = icon.getBoundingClientRect();
      let isLeft = (e.clientX - rect.left) < rect.width / 2;
      currentRating = isLeft ? leftValue : rightValue;

      renderStars(currentRating);
      document.getElementById("ratingValue").textContent = currentRating + "/10";
    });

    container.appendChild(icon);
  }
}

function highlightStars(value) {
  let stars = document.querySelectorAll("#starRating .star");
  stars.forEach((s, i) => {
    let leftHalf = i * 2 + 1;
    let rightHalf = i * 2 + 2;
    s.classList.remove("active", "half");
    if (value >= rightHalf) {
      s.classList.add("active"); // cheia
    } else if (value === leftHalf) {
      s.classList.add("half"); // meia
    }
  });
}

export function saveRating() {
  if (currentMovieIndex !== null) {
    movies[currentMovieIndex].userRating = currentRating;
    saveMovies();
    import("./ui.js").then(module => module.renderMovies());
    bootstrap.Modal.getInstance(document.getElementById("ratingModal")).hide();
  }
}