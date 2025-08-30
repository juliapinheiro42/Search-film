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

  const loading = document.getElementById("loading"); 
  loading.style.display = "block";

  try {
    let data = await fetchMovieData(title);
    let streaming = await fetchStreamingAvailability(data.Title, data.Year);

    // verifica duplicado (título + ano)
    let exists = movies.some(m => m.title === data.Title && m.releaseDate == data.Year);
    if (exists) {
      showMessage(`⚠️ "${data.Title}" já está na sua lista!`, "warning");
      return;
    }

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
    saveMovies(); 
    renderMovies();
    showMessage(`"${newMovie.title}" foi adicionado à sua lista.`, "success");

    document.getElementById("titleMovie").value = "";
  } catch (err) {
    showMessage(err.message, "warning");
  } finally {
    loading.style.display = "none";
  }
}

window.getMovies = getMovies; 
window.deleteMovie = function (i) {
  const movie = movies[i];
  if (confirm(`Deseja excluir "${movie.title}" da sua lista?`)) {
    movies.splice(i, 1);
    saveMovies(); 
    renderMovies();
    showMessage(`"${movie.title}" foi removido da lista.`, "success");
  }
};

function getTopRatedMovies() {
  const topRated = movies
    .filter(m => parseFloat(m.ratings) > 6)
    .sort((a, b) => parseFloat(b.ratings) - parseFloat(a.ratings));
  
  renderMovies(topRated); 
}
function getMoviesWithStreaming() {
  const withStreaming = movies.filter(m => 
    m.streaming && m.streaming !== "Nenhuma plataforma encontrada" && m.streaming !== "Erro ao buscar streaming"
  );
  renderMovies(withStreaming);
}
function getLongestMovie() {
  if (movies.length === 0) return;

  const longest = movies.reduce((longest, current) =>
    current.duration > longest.duration ? current : longest
  , movies[0]);

  renderMovies([longest]);
}

renderMovies();
window.openRatingModal = openRatingModal;
window.saveRating = saveRating;
window.getTopRatedMovies = getTopRatedMovies;
window.getMoviesWithStreaming = getMoviesWithStreaming;
window.getLongestMovie = getLongestMovie;