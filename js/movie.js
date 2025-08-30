export default class Movie {
  constructor(title, director, ratings, userRating, releaseDate, duration, streaming, poster) {
    this.title = title;
    this.director = director;
    this.ratings = ratings;
    this.userRating = userRating;
    this.releaseDate = releaseDate;
    this.duration = this.parseDuration(duration);
    this.streaming = streaming;
    this.poster = poster;
  }

  parseDuration(duration) {
    if (!duration) return 0;
    return parseInt(duration.replace("min", "").trim()) || 0;
  }
}
