import { Injectable } from "@angular/core";
import {
    BehaviorSubject,
    Observable,
    catchError,
    defer,
    delay,
    distinctUntilChanged,
    finalize,
    of,
    switchMap,
    take,
    takeUntil,
    tap,
    throwError
} from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";


import { 
    TCollectionParams,
    TFilter,
    TMovies,
    TMoviesAdd,
    TMoviesUpdate
} from "./types";
import { typedFastCopy } from "../utils";

//имитация работы с сервером, без потоков ...

export interface IMoviesService {
    list(collectionParams: TCollectionParams): Promise<TMovies[]>;
    get(id: number): Promise<TMovies>;
    add(data: TMoviesAdd): Promise<TMovies>;
    update(id: number, data: TMoviesUpdate): Promise<TMovies>;
    remove(id: number): Promise<boolean>;
    // getGenres(): Promise<string[]>;
    // getCreateYears(): Promise<number[]>;
}

@Injectable({
    providedIn: 'root'
})
export class MoviesService implements IMoviesService {
    // private _ready: boolean = false;
    // public readonly movies$: Observable<TMovies[]>;

    
    private _movies: TMovies[] = [];

    private _apiUrl = 'assets/data.json';
    private _moviesSubject$ = new BehaviorSubject<TMovies[]>([]);
    private _isLoading$ = new BehaviorSubject<boolean>(false); // нужно ли

    // public 

    constructor(private _http: HttpClient) {
        console.log('mov serv constr');
        // this.movies$ = this._moviesSubject.asObservable().pipe(
        //     distinctUntilChanged((prev, curr) => 
        //         JSON.stringify(prev) === JSON.stringify(curr)
        //     )
        // );

        this._initService();
    }

    public get isLoading$(): Observable<boolean> {
        return this._isLoading$.asObservable();
    }

    public get movies$(): Observable<TMovies[]> {
        return this._moviesSubject$.asObservable().pipe(
            distinctUntilChanged((prev, curr) =>
                JSON.stringify(prev) === JSON.stringify(curr)
            )
        );
    }

    public removeMovie(id: number): Observable<boolean> {
        this._isLoading$.next(true);

        return defer(() => {
            const isInclude = this._moviesSubject$.value.some(movie => movie.id === id);

            if (!isInclude) {
                console.log('net id');
                return throwError(() => new Error('Id not found'));
            }

            return of(true).pipe(
                delay(600),
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
            finalize(() => this._isLoading$.next(false))
        );
    }

    // public isLoading(): boolean {
    //     return this.isReady$
    // }

    private _initService(): void {
        this._isLoading$.next(true);
        this._http.get<TMovies[]>(this._apiUrl, {
            headers: new HttpHeaders({
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              })
        }).pipe(
            delay(1000),
            tap(value => {
                this._moviesSubject$.next(value);
                // this._isReady$.next(true);
            }),
            catchError(_error => {
                this._moviesSubject$.next([]);
                // this._isReady$.next(true);
                return of([]);
            }),
            finalize(() => {
                this._isLoading$.next(false);
            })
        ).subscribe();
    }

    // public init(): Promise<void> {
    //     return fetch(this._apiUrl).then(
    //         res => res.json()
    //     ).then(res2 => {
    //         this._movies = res2;
    //     }).catch(err => {
    //         this._movies = [];
    //     });
    // }

    public list(collectionParams: TCollectionParams = {}): Promise<TMovies[]> {
        const filters: TFilter = collectionParams.filters ?? {};
        let filteredMovies: TMovies[] = typedFastCopy(this._movies);

        return new Promise<TMovies[]>(resolve => {
            // по логике фильтрация должна быть на стороне бека, а это лишь имитация
            filteredMovies = this._doFiltration(filteredMovies, filters);
            resolve(filteredMovies);
        });
    }

    public list2(): Observable<TMovies[]> {
        return of(this._movies);
    }

    public get(id: number): Promise<TMovies> {
        return new Promise<TMovies>((resolve, reject) => {
            const movie = this._movies.find(item => item.id === id);
            if (!!movie) {
                resolve(movie as TMovies);
            } else {
                reject(new Error('Id not found'));
            }
        });
    }

    public add(data: Partial<TMovies>): Promise<TMovies> {
        return new Promise<TMovies>(resolve => {
            const date: Date = new Date(),
                year: number = date.getFullYear(),
                month: number = date.getMonth() + 1,
                day: number = date.getDate();

            const todayFull: string = String(day).padStart(2, '0') + String(month).padStart(2, '0') + year;
            const addData: TMovies = {
                abstract: data.abstract || '',
                actors: data.actors || [''],
                addDate: todayFull,
                director: data.director || '',
                genre: data.genre || '',
                id: this._movies.length ? this._movies[this._movies.length - 1].id + 1 : 1,
                name: data.name || '',
                rating: data.rating,
                updateDate: todayFull,
                year: data.year,
                slogan: data.slogan || '',
                personalAssessment: data.personalAssessment || 0
            }

            this._movies.push(addData);
            resolve(addData);
        });
    }

    public update(id: number, data: Partial<TMovies>): Promise<TMovies> {
        return new Promise<TMovies>((resolve, reject) => {
            const index = this._movies.findIndex(movie => movie.id === id);

            if (index !== -1) {
                const date: Date = new Date(),
                year: number = date.getFullYear(),
                month: number = date.getMonth() + 1,
                day: number = date.getDate();

                const todayFull: string = String(day).padStart(2, '0') + String(month).padStart(2, '0') + year;
                const updateData: TMovies = {
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

                this._movies[index] = {...this._movies[index], ...updateData};
                resolve(this._movies[index]);
            } else {
                reject(new Error('Id not found'));
            }
            
        });
    }

    public remove(id: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const index = this._movies.findIndex(movie => movie.id === id);
            if (index !== -1) {
                this._movies.splice(index, 1);
                resolve(true);
            } else {
                reject(new Error('Id not found'));
            }
        });
    }

    private _doFiltration(movies: TMovies[], filters: TFilter): TMovies[] {
        const {inputSearch, genre, createYear, addUpdateDate} = filters;

        if (inputSearch?.searchVal) {
            const searchQuery = inputSearch.searchVal.toLowerCase();
            movies = movies.filter(movie => movie.abstract.toLowerCase().includes(searchQuery) ||
                                        movie.actors.join(', ').toLowerCase().includes(searchQuery) ||
                                        movie.director.toLowerCase().includes(searchQuery) ||
                                        movie.name.toLowerCase().includes(searchQuery));
        }

        if (genre) {
            movies = movies.filter(movie => movie.genre === genre);
        }

        if (createYear) {
            movies = movies.filter(movie => movie.year?.toString() === createYear);
        }

        if (addUpdateDate) {
            movies = movies.filter(movie =>
                (movie.addDate?.toString() === addUpdateDate)
                || (movie.updateDate?.toString() === addUpdateDate)
            );
        }

        return movies;
    }

    // public getGenres(): Promise<string[]> {
    //     return new Promise<string[]>((resolve, reject) => {
    //         resolve(['']);

    //         reject(new Error('Genres error'));
    //     });
    // }

    // public getCreateYears(): Promise<number[]> {
    //     return new Promise<number[]>((resolve, reject) => {
    //         resolve([]);

    //         reject(new Error('Genres error'));
    //     });
    // }
}