import Movie from "./movie.js";
import { fetchMovieData, fetchStreamingAvailability } from "./api.js";
import { renderMovies, showMessage, openRatingModal, saveRating } from "./ui.js";

export let movies = JSON.parse(localStorage.getItem("movies")) || [];

export function saveMovies() {
  localStorage.setItem("movies", JSON.stringify(movies));
}

async function getMovies() {
  let title = document.getElementById("titleMovie").value.trim();
  if (!title) return showMessage("Digite um título!", "warning");

  try {
    let data = await fetchMovieData(title);
    let streaming = await fetchStreamingAvailability(data.Title, data.Year);

    let newMovie = new Movie(
      data.Title,
      data.Director,
      data.imdbRating,
      null,
      data.Year,
      data.Runtime,
      streaming,
      data.Poster
    );

    movies.push(newMovie);
    renderMovies();
    document.getElementById("titleMovie").value = "";
  } catch (err) {
    showMessage("⚠️ " + err.message, "warning");
  }
}

window.getMovies = getMovies; 
window.deleteMovie = function (i) {
  if (confirm("Deseja excluir este filme da sua lista?")) {
    movies.splice(i, 1);
    renderMovies();
  }
};

renderMovies();
window.openRatingModal = openRatingModal;
window.saveRating = saveRating;
