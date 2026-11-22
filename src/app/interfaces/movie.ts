export interface Movie {
    //forme allegee d une classe, on ne met que les attributs qu on veut utiliser dans l application
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    id: number;
    title: string;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    softcore: boolean;
    video: boolean;
    vote_average: number;
    vote_count: number;
    
}
