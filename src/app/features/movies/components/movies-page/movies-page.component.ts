import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, finalize, takeUntil } from 'rxjs';

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
export class MoviesPageComponent implements OnInit, OnDestroy, AfterViewInit {
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
  protected datePickerTypesEnum = DatePickerTypes;

  protected datePicCreateYearPlaceholder: string = 'Select year of creation...';
  protected datePicAddUpPlaceholder: string = 'Select date added or up...';
  protected selectGenrePlaceholder: string = 'Select genre...';
  protected isLoading: boolean = true;

  protected movies$ = this._moviesService.movies$;
  protected isVisibleModal$ = this._modalService.isVisible$;

  private _destroy$ = new Subject<void>(); //отписаться от потока в takeUntil
// задаю прямо, по хорошему нужно получать список жанров с бека учитывая сущестующие значения 
  protected genres: TDict[] = GENRES_DICT;

  constructor(private _moviesService: MoviesService, private readonly _modalService: ModalService) {}

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public ngOnInit(): void {
    this._loadMovies();
  }

  public ngAfterViewInit(): void {
    this._setFilters();
  }

  // TAppEvents ... решение в лоб ... по хорошему нужно сделать сервис
  // именно на форме понял что без сервиса тут вообще грязь 
  protected receiveItemEvents(event: TAppEvents) {
    if (event.type === AppEvents.EDIT && event.value) {
      this.openAddUpdateItemForm(event.value);
    }
  }

  protected inputSearchEvents(event: TAppEvents) {
    if (event.type === AppEvents.SEARCH) {
      if (Object.prototype.hasOwnProperty.call(event , 'value')) {
        this.filters = {
          ...this.filters,
          inputSearch: {
            ...this.filters.inputSearch,
            searchVal: event.value
          }
        };
      }
      this._setFilters();
    }
  }

  protected selectedEvents(event: TAppEvents) {
    if (event.type === AppEvents.SELECTED) {
      this._setFilters();
    }
  }

  protected calendarEvents(event: TAppEvents) {
    if (event.type === AppEvents.SELECTED) {
      this._setFilters();
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
    }
  }

  private _loadMovies(): void {
    this._moviesService.list().pipe(
      finalize(() => this.isLoading = false),
      takeUntil(this._destroy$)
    ).subscribe();
  }

  private _setFilters(): void {
    this._moviesService.setFilters({...this.filters});
  }
}
