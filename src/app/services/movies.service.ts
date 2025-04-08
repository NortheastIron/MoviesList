import { Injectable } from "@angular/core";

import { TCollectionParams,
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
    private _ready: boolean = false;
    private _movies: TMovies[] = [];
    private _apiUrl = 'assets/data.json';

    constructor() {

    }

    public init() {
        return fetch(this._apiUrl).then(
            res => res.json()
        ).then(res2 => {
            this._movies = res2;
        }).catch(err => {
            this._movies = [];
        });
    }

    public list(collectionParams: TCollectionParams = {}): Promise<TMovies[]> {
        const filters: TFilter = collectionParams.filters ?? {};
        let filteredMovies: TMovies[] = typedFastCopy(this._movies);

        return new Promise<TMovies[]>(resolve => {
            // по логике фильтрация должна быть на стороне бека, а это лишь имитация
            filteredMovies = this._doFiltration(filteredMovies, filters);
            resolve(filteredMovies);
        });
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