
import { Component, inject, signal, computed } from '@angular/core';
import { MovieService } from '../../services/movie-service';
import { OnInit } from '@angular/core';
import { Movie } from '../../interfaces/movie';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-movie-list',
  styleUrl: './movie-list.css',
  templateUrl: './movie-list.html',
})
export class MovieList implements OnInit {

  router = inject(Router);

  movieList: Movie[] = []; // tableau de Movie vide pour stocker les films récupérés depuis l'API

  // Injection du service, comme dans le cours
  movieService = inject(MovieService);

  // PAGINATION ORIGINALE
  currentPage = signal(1);
  moviesPerPage = 8;

  // Nombre total de pages
  totalPages = computed(() =>
    Math.ceil(
      this.movieService.movieList().length / this.moviesPerPage
    )
  );

  // Films affichés sur la page actuelle
  paginatedMovies = computed(() => {
    const start = (this.currentPage() - 1) * this.moviesPerPage;

    return this.movieService.movieList().slice(
      start,
      start + this.moviesPerPage
    );
  });

  // Film mis en avant dans la bannière
  featuredMovie = computed(() =>
    this.movieService.movieList()[0] ?? null
  );

  // Films pour le carrousel animé
  carouselMovies = computed(() =>
    this.movieService.movieList().slice(0, 12)
  );

  // Liste des pages pour une pagination compacte
  pageNumbers = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();

    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);

    const pages: number[] = [];

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    return pages;
  });

  ngOnInit(): void {

    // AJOUT : récupérer l'historique sauvegardé
    this.movieService.loadHistory();

    // TON CODE ORIGINAL DU PROFESSEUR
    this.movieService.getMoovieList().subscribe(
      response => {
        this.movieService.movieList.set(response);
        console.log(this.movieService.movieList());

        // Retour à la première page après chargement
        this.currentPage.set(1);
      }
    );

    // Appel de la fonction getMoovieList() du service MovieService
    // pour récupérer les films depuis l'API
  }

  // Navigation originale du professeur
  navigateTo(movie: Movie) {
    this.router.navigate([`/`, movie.id]);
  }

  // Changer de page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  // Page précédente
  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  // Page suivante
  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  // Première page
  firstPage(): void {
    this.goToPage(1);
  }

  // Dernière page
  lastPage(): void {
    this.goToPage(this.totalPages());
  }

  // ===================================
  // AJOUT : GESTION DE L'HISTORIQUE
  // ===================================

  // Supprimer un film de l'historique
  removeFromHistory(movie: Movie): void {
    this.movieService.removeFromHistory(movie.id);
  }

  // Vider l'historique avec confirmation
  clearHistory(): void {
    if (confirm('Are you sure you want to clear your history?')) {
      this.movieService.clearHistory();
    }
  }
}
