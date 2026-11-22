
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, shareReplay, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import { Movie } from '../interfaces/movie';
import { MovieResponse } from '../interfaces/movie-response';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  private readonly http = inject(HttpClient);
  private readonly url = environment.url_api;
  private readonly key = environment.api_key;
  private readonly movieUrl = environment.url_movie_api;

  public movieList = signal<Movie[]>([]);
  public selectedMovie = signal<Movie | null>(null);
  public wishList = signal<Movie[]>([]);

  // AJOUT : historique des films consultés
  public viewHistory = signal<Movie[]>([]);

  // AJOUT : clé de sauvegarde de l'historique
  private readonly historyKey = 'movie-db-history';

  // AJOUT : nombre maximum de films dans l'historique
  private readonly maxHistory = 20;

  // AJOUT : nombre de pages TMDB à récupérer
  private readonly numberOfPages = 10;

  // Récupérer plusieurs pages de films avec la même API
  getMoovieList(): Observable<Movie[]> {

    const requests: Observable<Movie[]>[] = [];

    for (let page = 1; page <= this.numberOfPages; page++) {

      const request = this.http
        .get<MovieResponse>(
          `${this.url}?api_key=${this.key}&page=${page}`
        )
        .pipe(
          map(response => response.results)
        );

      requests.push(request);
    }

    return forkJoin(requests).pipe(

      // Réunir tous les films dans un seul tableau
      map(pages => pages.flat()),

      // Éviter les doublons grâce à l'identifiant du film
      map(movies =>
        movies.filter((movie, index, array) =>
          array.findIndex(m => m.id === movie.id) === index
        )
      ),

      shareReplay({ bufferSize: 1, refCount: false })
    );
  }

  // Récupérer les détails d'un film par son ID
  getMovieById(id: number): Observable<Movie> {
    return this.http.get<Movie>(
      `${this.movieUrl}/${id}?api_key=${this.key}`
    );
  }

  // Ajouter un film à la Wishlist
  addToWishList(movie: Movie): void {
    this.wishList.update(wishlist => {
      if (wishlist.some(m => m.id === movie.id)) {
        return wishlist;
      }

      return [...wishlist, movie];
    });
  }

  // Supprimer un film de la Wishlist
  removeFromWishList(id: number): void {
    this.wishList.update(wishlist =>
      wishlist.filter(movie => movie.id !== id)
    );
  }

  // ===================================
  // AJOUT : GESTION DE L'HISTORIQUE
  // ===================================

  // Charger l'historique sauvegardé
  loadHistory(): void {
    try {
      const savedHistory = localStorage.getItem(this.historyKey);

      if (savedHistory) {
        const movies: Movie[] = JSON.parse(savedHistory);

        if (Array.isArray(movies)) {
          this.viewHistory.set(movies.slice(0, this.maxHistory));
        }
      }
    } catch (error) {
      console.error('Error loading movie history:', error);
    }
  }

  // Sauvegarder l'historique
  saveHistory(): void {
    try {
      localStorage.setItem(
        this.historyKey,
        JSON.stringify(this.viewHistory())
      );
    } catch (error) {
      console.error('Error saving movie history:', error);
    }
  }

  // Ajouter un film consulté à l'historique
  addToHistory(movie: Movie): void {

    this.viewHistory.update(history => {

      // Supprimer l'ancienne occurrence du film
      const filteredHistory = history.filter(
        m => m.id !== movie.id
      );

      // Placer le film consulté en premier
      return [movie, ...filteredHistory].slice(
        0,
        this.maxHistory
      );

    });

    this.saveHistory();
  }

  // Supprimer un film de l'historique
  removeFromHistory(id: number): void {

    this.viewHistory.update(history =>
      history.filter(movie => movie.id !== id)
    );

    this.saveHistory();
  }

  // Vider tout l'historique
  clearHistory(): void {
    this.viewHistory.set([]);
    this.saveHistory();
  }
}
