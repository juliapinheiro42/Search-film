const API_KEY = "d79ffdc7";
const RAPIDAPI_KEY = "9f518503f0mshbae0949c63597a2p1a9ba1jsn6ae47101ae0f";

export async function fetchMovieData(title) {
  const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${API_KEY}`);
  const data = await response.json();
  if (data.Response === "False") throw new Error("Filme não encontrado!");
  return data;
}

export async function fetchStreamingAvailability(title, year) {
  let cacheKey = `streaming_${title}_${year}`;
  let cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  const url = `https://streaming-availability.p.rapidapi.com/shows/search/title?country=br&title=${encodeURIComponent(title)}&show_type=movie&output_language=en`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": "streaming-availability.p.rapidapi.com"
    }
  };

  try {
    const searchRes = await fetch(url, options);
    const searchData = await searchRes.json();

    if (!searchData || searchData.length === 0) return "Nenhuma plataforma encontrada";

    const show = searchData.find(s => s.year == year) || searchData[0];
    const detailsRes = await fetch(`https://streaming-availability.p.rapidapi.com/shows/${show.id}?country=br&output_language=en`, options);
    const detailsData = await detailsRes.json();

    if (detailsData?.streamingOptions?.br) {
      let plataforms = detailsData.streamingOptions.br.map(p => p.service?.name || "Desconhecido");
      let result = [...new Set(plataforms)].join(", ");
      localStorage.setItem(cacheKey, result);
      return result;
    }
    return "Nenhuma plataforma encontrada";
  } catch {
    return "Erro ao buscar streaming";
  }
}
