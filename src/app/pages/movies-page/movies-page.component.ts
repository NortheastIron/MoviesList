import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, takeUntil } from 'rxjs';

import { AppEvents, MoviesService, TAppEvents, TMovies } from '../../services';
import { MoviesItemComponent } from '../../components/movies-item/movies-item.component';
import { InputSearchComponent } from "../../components/filters/input-search/input-search.component";
import { DatepickerComponent, DatePickerTypes } from "../../components/filters/datepicker/datepicker.component";
import { SelectComponent, TDict } from "../../components/select/select.component";
import { ModalComponent } from "../../components/modal/modal.component";
import { ModalService } from '../../services/modal.service';
import { MoviesItemEditFormComponent } from "../../components/movies-item/edit-form/movies-item.edit-form.component";

// подумать над именем и мб перенести
export enum GenresEnum {
  action = 'action',
  adventure = 'adventure',
  comedy = 'comedy',
  drama = 'drama',
  fantasy = 'fantasy',
  historical = 'historical'
}

type TPageFilters = {
  // данный способ передачи даннных мб и костыль, но это временно~постоя.. решение, как хранить состояние ввода, но при этом делать 
  // поиск от 3-х элементов, а если меньше 3-х то получается пустой поиск???...
  inputSearch: {
    inputVal: string;
    searchVal: string;
  };
  createYear: string;
  addUpdateDate: string;
  genre: GenresEnum | string;
};

type TFormState = {
  id?: number;
  title?: string;
}

@Component({
  selector: 'app-movies-page',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    MoviesItemComponent,
    InputSearchComponent,
    DatepickerComponent,
    SelectComponent,
    ModalComponent,
    MoviesItemEditFormComponent
],
  templateUrl: './movies-page.component.html',
  styleUrl: './movies-page.component.less',
  providers: [MoviesService]
})
export class MoviesPageComponent implements OnInit, OnDestroy {
  protected loading: boolean = true;
  protected movies: TMovies[] = [];
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
  protected genres: TDict[] = [
    {key: '', name: ''},
    {key: GenresEnum.action, name: 'Action'},
    {key: GenresEnum.adventure, name: 'Adventure'},
    {key: GenresEnum.comedy, name: 'Comedy'},
    {key: GenresEnum.drama, name: 'Drama'},
    {key: GenresEnum.fantasy, name: 'Fantasy'},
    {key: GenresEnum.historical, name: 'Historical'}
  ];

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
    this._moviesService.list({filters: this.filters}).then((list: TMovies[]) => {
      this.movies = list;
    }).finally(() => {
      this.loading = false;
    });
  }
}
