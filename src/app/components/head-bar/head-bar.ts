
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { MovieService } from '../../services/movie-service';

@Component({
  imports: [FontAwesomeModule],
  selector: 'app-head-bar',
  styleUrl: './head-bar.css',
  templateUrl: './head-bar.html',
})
export class HeadBar {
  faHeart = faHeart;

  router = inject(Router);

  // AJOUT : accès aux films favoris
  movieService = inject(MovieService);

  // AJOUT : accès au document HTML
  private document = inject(DOCUMENT);

  // AJOUT : mode jour / nuit
  isLight = signal(
    this.document.documentElement.classList.contains('light-theme')
  );

  // TON CODE ORIGINAL
  navigateToWishList(): void {
    this.router.navigate(['/wishlist']);
  }

  // AJOUT : retour à l'accueil
  navigateHome(): void {
    this.router.navigate(['/']);
  }

  // AJOUT : changement de thème
  toggleTheme(): void {
    const next = !this.isLight();

    this.isLight.set(next);

    this.document.documentElement.classList.toggle(
      'light-theme',
      next
    );
  }
}
