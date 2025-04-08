import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppEvents, MoviesService, TAppEvents, TMovies } from '../../../services';
import { ModalService } from '../../../services/modal.service';
import { DatePickerTypes, DatepickerComponent } from "../../filters/datepicker/datepicker.component";
import { SelectComponent, TDict } from "../../select/select.component";
import { GenresEnum } from '../../../pages/movies-page/movies-page.component';
import { CustomInputComponent } from "../../custom-input/custom-input.component";
import { CustomTextareaComponent } from "../../custom-textarea/custom-textarea.component";
import { CustomRangeComponent } from "../../custom-range/custom-range.component";
import { typedFastCopy } from '../../../utils';

@Component({
  selector: 'app-movies-item-edit-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatepickerComponent,
    SelectComponent,
    CustomInputComponent,
    CustomTextareaComponent,
    CustomRangeComponent
  ],
  templateUrl: './movies-item.edit-form.component.html',
  styleUrl: './movies-item.edit-form.component.less'
})
export class MoviesItemEditFormComponent implements OnInit {
  protected isLoading: boolean = false;
  protected movie: Partial<TMovies> = this._getDefaultMovie();
  protected datePickerTypesEnum = DatePickerTypes;
  protected appEventsEnum = AppEvents;
  protected datePicYearPlaceholder: string = 'Select year ...';
  protected nameInputPlaceholder: string = 'Input name ...';
  protected directorInputPlaceholder: string = 'Input director ...';
  protected selectGenrePlaceholder: string = 'Select genre ...';
  protected actorNameInputPlaceholder: string = 'Input actor name ...';
  protected abstractInputPlaceholder: string = 'Input abstract ...';
  protected sloganInputPlaceholder: string = 'Input slogan ...';

  protected genres: TDict[] = [
    {key: '', name: ''},
    {key: GenresEnum.action, name: 'Action'},
    {key: GenresEnum.adventure, name: 'Adventure'},
    {key: GenresEnum.comedy, name: 'Comedy'},
    {key: GenresEnum.drama, name: 'Drama'},
    {key: GenresEnum.fantasy, name: 'Fantasy'},
    {key: GenresEnum.historical, name: 'Historical'}
  ];

  @Input() id?: number;
  @Output() appEvents = new EventEmitter<TAppEvents>();

  constructor(private _moviesService: MoviesService, private _modalService: ModalService) {}

  public ngOnInit(): void {
    this._initMovie();
  }

  // пока что временно сделал без реактивной формы
  protected isValid(): boolean {
    const movie = this.movie;
    return !this.isLoading
      && !!movie
      && movie.name !== ''
      && movie.genre !== ''
      && movie.director !== ''
      && movie.actors!.every(actorName => actorName !== '');
  }

  protected submit() {
    this.isLoading = true;
    const data: Partial<TMovies> = typedFastCopy(this.movie);

    let promise: Promise<TMovies>;
    if (this.id) {
      promise = this._moviesService.update(this.id, data);
    } else {
      promise = this._moviesService.add(data);
    }

    promise.then((_res) => {
      this.closeForm(AppEvents.UPDATE)
    }).catch((_err) => {
      //тут можно вызвать окно с ошибкой
      this.isLoading = false;
    });
  }

  protected addActorStr() {
    this.movie && this.movie.actors?.push('');
  }

  protected closeForm(event: AppEvents): void {
    this.appEvents.emit({type: event});
    this._modalService.close();
  }

  protected onPersonalAssessment(value: number): void {
    this.movie.personalAssessment = value;
  }

  // слишком ультимативно для данного места, но мб где ещё потом пригодится
  protected isLastItemMovieProperty<K extends keyof TMovies>(key: K): boolean {
    const property = this.movie[key];

    return !Array.isArray(property) || property.length < 2;
  }

  protected removeActorStr(index: number): void {
    this.movie.actors?.splice(index, 1);
  }

  private async _initMovie(): Promise<void> {
    this.isLoading = true;

    if (this.id) {
        await this._load();
    }
    this.isLoading = false;
  }

  private _load(): Promise<void> {
    return this._moviesService.get(this.id!).then((result: TMovies) => {
        this.movie = {...result};
        if (!this.movie.actors?.length) {
          this.movie.actors = [''];
        }
    });
  }

  private _getDefaultMovie(): Partial<TMovies> {
    return {
        abstract: '',
        actors: [''],
        director: '',
        genre: '',
        name: '',
        rating: undefined,
        year: '',
        slogan: '',
        personalAssessment: 0
    };
  }
}
