
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { MovieService } from '../../services/movie-service';
import { Movie } from '../../interfaces/movie';

@Component({
  imports: [],
  selector: 'app-movie-detail',
  styleUrl: './movie-detail.css',
  templateUrl: './movie-detail.html',
})
export class MovieDetail implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public movieService = inject(MovieService);

  ngOnInit(): void {

    // AJOUT : charger l'historique sauvegardé
    this.movieService.loadHistory();

    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        return this.movieService.getMovieById(id);
      })
    ).subscribe(movie => {

      // TON CODE ORIGINAL
      this.movieService.selectedMovie.set(movie);

      // AJOUT : enregistrer le film consulté
      this.movieService.addToHistory(movie);

    });
  }

  backToMovieList(): void {
    this.router.navigate(['/']);
  }

  addToWish(movie: Movie | null): void {
    if (movie) {
      this.movieService.addToWishList(movie);
      alert('Movie added to Wishlist!');
    }
  }
}
