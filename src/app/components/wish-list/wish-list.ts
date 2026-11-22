
import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MovieService } from '../../services/movie-service';
import { Movie } from '../../interfaces/movie';

@Component({
  imports: [],
  selector: 'app-wish-list',
  styleUrl: './wish-list.css',
  templateUrl: './wish-list.html',
})
export class WishList {

  public movieService = inject(MovieService);
  private router = inject(Router);

  // Recherche et tri
  searchTerm = signal('');
  sortMode = signal('recent');

  // Nombre de films favoris
  totalMovies = computed(() =>
    this.movieService.wishList().length
  );

  // Liste filtrée et triée
  filteredMovies = computed(() => {

    let movies = [...this.movieService.wishList()];

    const search = this.searchTerm().toLowerCase().trim();

    if (search) {
      movies = movies.filter(movie =>
        (movie.title || movie.original_title || '')
          .toLowerCase()
          .includes(search)
      );
    }

    if (this.sortMode() === 'title') {
      movies.sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    if (this.sortMode() === 'rating') {
      movies.sort((a, b) =>
        (b.vote_average ?? 0) - (a.vote_average ?? 0)
      );
    }

    return movies;
  });

  // Ouvrir les détails d'un film
  navigateToMovie(movie: Movie): void {
    this.router.navigate(['/', movie.id]);
  }

  // Supprimer un favori
  removeFromWishList(movie: Movie): void {
    this.movieService.removeFromWishList(movie.id);
  }

  // Retour à la liste des films
  backToMovieList(): void {
    this.router.navigate(['/']);
  }
}
