import { Injectable } from "@angular/core";
import {
    BehaviorSubject,
    Observable,
    catchError,
    combineLatest,
    debounceTime,
    defer,
    delay,
    distinctUntilChanged,
    first,
    map,
    of,
    take,
    tap,
    throwError
} from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { TFilter, customIsEqual, getTodayFullString } from "@core";
import { TMovie } from "../models";

@Injectable()
export class MoviesService {

    private _apiUrl = 'assets/data.json';
    private _moviesSubject$ = new BehaviorSubject<TMovie[]>([]);
    private _filtersSubject$ = new BehaviorSubject<TFilter>({});

    constructor(private _http: HttpClient) {
    }

    public setFilters(filters: TFilter): void {
        this._filtersSubject$.next(filters);
    }
    
    public get movies$(): Observable<TMovie[]> {
        return combineLatest([
            this._moviesSubject$.pipe(distinctUntilChanged(customIsEqual)),
            this._filtersSubject$.pipe(
                debounceTime(300),
                distinctUntilChanged(customIsEqual)
            )
        ]).pipe(
            map(([movies, filters]) => this._applyFilters(movies, filters))
        );
    }

    public get(id: number): Observable<TMovie | undefined> {

        return this._moviesSubject$.pipe(
            map(movies => movies.find(movie => movie.id === id)),
            catchError(err => {
                return of(undefined);
            }),
            first()
        );
    }

    public update(id: number, data: Partial<TMovie>): Observable<boolean> {

        const todayFull: string = getTodayFullString();
        const updateData: TMovie = {
            abstract: data.abstract || '',
            actors: data.actors || [''],
            addDate: data.addDate || '',
            director: data.director || '',
            genre: data.genre || '',
            id: id,
            name: data.name || '',
            rating: data.rating,
            updateDate: todayFull,
            year: data.year,
            slogan: data.slogan || '',
            personalAssessment: data.personalAssessment || 0,
        }

        return defer(() => {
            const isInclude = this._moviesSubject$.value.some(movie => movie.id === id);

            if (!isInclude) {
                return throwError(() => new Error('Id not found'));
            }

            return of(true).pipe(
                tap(() => {
                    const upList = this._moviesSubject$.getValue().map(movie => {
                        if (movie.id === id) {
                            return updateData;
                        }
                        return movie;
                    });
                    this._moviesSubject$.next(upList);
                })
            );
        }).pipe(
            // delay(1000),
            catchError(err => {
                //exp тут можно будет добавить какую то работу с ошибками?
                return of(false);
            }),
        );
    
    }

    public remove(id: number): Observable<boolean> {

        return defer(() => {
            const isInclude = this._moviesSubject$.value.some(movie => movie.id === id);

            if (!isInclude) {
                console.log('net id');
                return throwError(() => new Error('Id not found'));
            }

            return of(true).pipe(
                // delay(600),
                tap(() => {
                    const updatedList = this._moviesSubject$.value.filter(movie => movie.id !== id);
                    this._moviesSubject$.next(updatedList);
                })
            );
        }).pipe(
            catchError(err => {
                //exp тут можно будет добавить какую то работу с ошибками?
                return of(false);
            }),
        );
    }

    public add(data: Partial<TMovie>): Observable<boolean> {
        const moviesList = this._moviesSubject$.value;

        const todayFull: string = getTodayFullString();
        const addData: TMovie = {
            abstract: data.abstract || '',
            actors: data.actors || [''],
            addDate: todayFull,
            director: data.director || '',
            genre: data.genre || '',
            id: moviesList.length ? moviesList[moviesList.length - 1].id + 1 : 1,
            name: data.name || '',
            rating: data.rating,
            updateDate: todayFull,
            year: data.year,
            slogan: data.slogan || '',
            personalAssessment: data.personalAssessment || 0
        }

        return of(true).pipe(
            tap(() => {
                const updatedList = [...moviesList, addData];
                this._moviesSubject$.next(updatedList);
            }),
            catchError(_error => {
                 //exp тут можно будет добавить какую то работу с ошибками?
                return of(false);
            }),
        )
    }

    public list(): Observable<void> {

        return this._http.get<TMovie[]>(this._apiUrl + '?t=' + Date.now(), {
            headers: new HttpHeaders({
                'Cache-Control': 'no-cache, no-store',
                'Pragma': 'no-cache'
              })
            }
        ).pipe(
            tap({
                next: (movies) => {
                    this._moviesSubject$.next(movies);
                },
                error: (err) => {
                    this._moviesSubject$.next([]);
                }
            }),
            map(() => {
                void 0;
            }),
            take(1)
        );
    }

    private _applyFilters(movies: TMovie[], filters: TFilter): TMovie[] {
        return movies.filter(movie => {
            return this.checkSearchMatch(movie, filters)
                && this.checkGenreMatch(movie, filters)
                && this.checkCreateYearMatch(movie, filters)
                && this.checkDateMatch(movie, filters);
        });
    }

    private checkSearchMatch(movie: TMovie, filters: TFilter): boolean {
        const searchQuery = filters['inputSearch']?.searchVal?.toLowerCase() || '';

        if (!searchQuery) {
            return true;
        }

        return [
            movie.name,
            movie.abstract,
            movie.director,
            movie.actors?.join(', ') || ''
        ].some(field => field.toLocaleLowerCase().includes(searchQuery));
    }

    private checkGenreMatch(movie: TMovie, filters: TFilter): boolean {
        const genreQuery = filters['genre'];

        return !genreQuery || movie.genre === genreQuery;
    }
    
    private checkCreateYearMatch(movie: TMovie, filters: TFilter): boolean {
        const createYearQuery = filters['createYear'];

        return !createYearQuery || movie.year?.toString() === createYearQuery;
    }

    private checkDateMatch(movie: TMovie, filters: TFilter): boolean {
        const dateQuery = filters['addUpdateDate'];

        return !dateQuery
            || ((movie.addDate?.toString() === dateQuery)
            || (movie.updateDate?.toString() === dateQuery));
    }
}
