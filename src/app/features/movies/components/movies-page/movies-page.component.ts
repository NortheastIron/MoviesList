import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppEvents, ModalService, TAppEvents, TDict } from '@core';
import {
  DatePickerTypes,
  DatepickerComponent,
  InputSearchComponent,
  ModalComponent,
  SelectComponent
} from '@shared';
import { MoviesService } from '@features/movies/services';
import { TMovie } from '@features/movies/models';
import { GENRES_DICT } from '@features/movies/constants';

import { TFormState, TPageFilters } from './models';
import { MoviesPageEditFormComponent } from './edit-form';
import { MoviesPageItemComponent } from './item';

@Component({
  selector: 'app-movies-page',
  standalone: true,
  imports: [
    CommonModule,
    MoviesPageItemComponent,
    InputSearchComponent,
    DatepickerComponent,
    SelectComponent,
    ModalComponent,
    MoviesPageEditFormComponent
],
  templateUrl: './movies-page.component.html',
  styleUrl: './movies-page.component.less',
  providers: [MoviesService]
})
export class MoviesPageComponent implements OnInit, OnDestroy {
  protected loading: boolean = true;
  protected movies: TMovie[] = [];
  protected isFilters: boolean = false;
  protected filters: TPageFilters = {
    inputSearch: {
      inputVal: '',
      searchVal: '',
    },
    createYear: '',
    addUpdateDate: '',
    genre: ''
  };
  protected formState: TFormState | null = null;
  // protected isformVisible: boolean = false;
  protected datePickerTypesEnum = DatePickerTypes;

  protected datePicCreateYearPlaceholder: string = 'Select year of creation...';
  protected datePicAddUpPlaceholder: string = 'Select date added or up...';
  protected selectGenrePlaceholder: string = 'Select genre...';

  protected movies$ = this._moviesService.movies$;
  protected isLoading$ = this._moviesService.isLoading$;
  protected isVisibleModal$ = this._modalService.isVisible$;

  // private _modalSubscription: Subscription | undefined;
  // private destroy$ = new Subject<void>(); //отписаться от потока в takeUntil

  // private _subs: Subscription = new Subscription();

// задаю прямо, по хорошему нужно получать список жанров с бека учитывая сущестующие значения 
  protected genres: TDict[] = GENRES_DICT;

  constructor(private _moviesService: MoviesService, private readonly _modalService: ModalService) {
    console.log('mov page constr');
  }

  public ngOnDestroy(): void {
    // this.destroy$.next();
    // this.destroy$.complete();
    // this._modalSubscription?.unsubscribe();
    // this._subs.unsubscribe();
  }

  public ngOnInit(): void {
    console.log('mov page ngoninit');
    // this.loading = true;
    //т.к. бэк не прикручен, жду файл а потом работаю с массивом
    // this._moviesService.testHttp().subscribe({
    //   next: movies => {
    //     console.log('mov', movies);
    //   },
    //   error: () => {
    //     console.log('err');
    //   }
    // });
    // this._moviesService.init().then(() => {
    //   this._load();
    // });

    // this._subs.add(
    //   this._modalService.isVisible$.subscribe({
    //     next: (value: boolean) => {
    //       this.isformVisible = value;
    //     }
    //   })
    // );
  }

  // TAppEvents ... решение в лоб ... по хорошему нужно сделать сервис
  // именно на форме понял что без сервиса тут вообще грязь 
  protected receiveItemEvents(event: TAppEvents) {
    if (event.type === AppEvents.EDIT && event.value) {
      this.openAddUpdateItemForm(event.value);
    } else if (event.type === AppEvents.UPDATE) {
      this._load();
    }
  }

  protected inputSearchEvents(event: TAppEvents) {
    if (event.type === AppEvents.SEARCH) {
      if (Object.prototype.hasOwnProperty.call(event , 'value')) {
        this.filters.inputSearch.searchVal = event.value;
      }
      this._load();
    }
  }

  protected selectedEvents(event: TAppEvents) {
    if (event.type === AppEvents.SELECTED) {
      this._load();
    }
  }

  protected calendarEvents(event: TAppEvents) {
    if (event.type === AppEvents.SELECTED) {
      this._load();
    }
  }

  protected openAddUpdateItemForm(id?: number) {
    this.formState = this.formState || {
      id: id,
      title: id ? 'Edit movie' : 'Add movie'
    };
    this._modalService.open();
  }

  protected closeAddUpdateItemForm() {
    this.formState = null;
  }

  protected modalEventsHandler(event: TAppEvents): void {
    if (event.type === AppEvents.CLOSE) {
      this.closeAddUpdateItemForm();
    }
  }

  protected editFormEventsHandler(event: TAppEvents): void {
    if (event.type === AppEvents.CLOSE) {
      this.closeAddUpdateItemForm();
    } else if (event.type === AppEvents.UPDATE) {
      this.closeAddUpdateItemForm();
      this._load();
    }
  }

  private _load(): void {
    this.loading = true;
    this._moviesService.list({filters: this.filters}).then((list: TMovie[]) => {
      this.movies = list;
    }).finally(() => {
      this.loading = false;
    });
  }
}
