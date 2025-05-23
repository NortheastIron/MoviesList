   // private _doFiltration(movies: TMovie[], filters: TFilter): TMovie[] {
    //     const {inputSearch, genre, createYear, addUpdateDate} = filters;

    //     if (inputSearch?.searchVal) {
    //         const searchQuery = inputSearch.searchVal.toLowerCase();
    //         movies = movies.filter(movie => movie.abstract.toLowerCase().includes(searchQuery) ||
    //                                     movie.actors.join(', ').toLowerCase().includes(searchQuery) ||
    //                                     movie.director.toLowerCase().includes(searchQuery) ||
    //                                     movie.name.toLowerCase().includes(searchQuery));
    //     }

    //     if (genre) {
    //         movies = movies.filter(movie => movie.genre === genre);
    //     }

    //     if (createYear) {
    //         movies = movies.filter(movie => movie.year?.toString() === createYear);
    //     }

    //     if (addUpdateDate) {
    //         movies = movies.filter(movie =>
    //             (movie.addDate?.toString() === addUpdateDate)
    //             || (movie.updateDate?.toString() === addUpdateDate)
    //         );
    //     }

    //     return movies;
    // }

    // public init(): Promise<void> {
    //     return fetch(this._apiUrl).then(
    //         res => res.json()
    //     ).then(res2 => {
    //         this._movies = res2;
    //     }).catch(err => {
    //         this._movies = [];
    //     });
    // }

    // public list(collectionParams: TCollectionParams = {}): Promise<TMovie[]> {
    //     const filters: TFilter = collectionParams.filters ?? {};
    //     let filteredMovies: TMovie[] = typedFastCopy(this._movies);

    //     return new Promise<TMovie[]>(resolve => {
    //         // по логике фильтрация должна быть на стороне бека, а это лишь имитация
    //         filteredMovies = this._doFiltration(filteredMovies, filters);
    //         resolve(filteredMovies);
    //     });
    // }

    // public list2(): Observable<TMovie[]> {
    //     return of(this._movies);
    // }

    // public get(id: number): Promise<TMovie> {
    //     return new Promise<TMovie>((resolve, reject) => {
    //         const movie = this._movies.find(item => item.id === id);
    //         if (!!movie) {
    //             resolve(movie as TMovie);
    //         } else {
    //             reject(new Error('Id not found'));
    //         }
    //     });
    // }

    // public add(data: Partial<TMovie>): Promise<TMovie> {
    //     return new Promise<TMovie>(resolve => {
    //         const date: Date = new Date(),
    //             year: number = date.getFullYear(),
    //             month: number = date.getMonth() + 1,
    //             day: number = date.getDate();

    //         const todayFull: string = String(day).padStart(2, '0') + String(month).padStart(2, '0') + year;
    //         const addData: TMovie = {
    //             abstract: data.abstract || '',
    //             actors: data.actors || [''],
    //             addDate: todayFull,
    //             director: data.director || '',
    //             genre: data.genre || '',
    //             id: this._movies.length ? this._movies[this._movies.length - 1].id + 1 : 1,
    //             name: data.name || '',
    //             rating: data.rating,
    //             updateDate: todayFull,
    //             year: data.year,
    //             slogan: data.slogan || '',
    //             personalAssessment: data.personalAssessment || 0
    //         }

    //         this._movies.push(addData);
    //         resolve(addData);
    //     });
    // }

    // public update(id: number, data: Partial<TMovie>): Promise<TMovie> {
    //     return new Promise<TMovie>((resolve, reject) => {
    //         const index = this._movies.findIndex(movie => movie.id === id);

    //         if (index !== -1) {
    //             const date: Date = new Date(),
    //             year: number = date.getFullYear(),
    //             month: number = date.getMonth() + 1,
    //             day: number = date.getDate();

    //             const todayFull: string = String(day).padStart(2, '0') + String(month).padStart(2, '0') + year;
    //             const updateData: TMovie = {
    //                 abstract: data.abstract || '',
    //                 actors: data.actors || [''],
    //                 addDate: data.addDate || '',
    //                 director: data.director || '',
    //                 genre: data.genre || '',
    //                 id: id,
    //                 name: data.name || '',
    //                 rating: data.rating,
    //                 updateDate: todayFull,
    //                 year: data.year,
    //                 slogan: data.slogan || '',
    //                 personalAssessment: data.personalAssessment || 0,
    //             }

    //             this._movies[index] = {...this._movies[index], ...updateData};
    //             resolve(this._movies[index]);
    //         } else {
    //             reject(new Error('Id not found'));
    //         }
            
    //     });
    // }

    // public remove(id: number): Promise<boolean> {
    //     return new Promise<boolean>((resolve, reject) => {
    //         const index = this._movies.findIndex(movie => movie.id === id);
    //         if (index !== -1) {
    //             this._movies.splice(index, 1);
    //             resolve(true);
    //         } else {
    //             reject(new Error('Id not found'));
    //         }
    //     });
    // }

    

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
// }