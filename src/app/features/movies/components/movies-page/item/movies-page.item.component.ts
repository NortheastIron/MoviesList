import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AppEvents, TAppEvents } from '@core';
import { TMovie } from '@features/movies/models';
import { MoviesService } from '@features/movies/services';

@Component({
  selector: 'app-movies-page-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movies-page.item.component.html',
  styleUrl: './movies-page.item.component.less'
})
export class MoviesPageItemComponent implements OnDestroy {
  @Input() movie!: TMovie;
  @Output() appEvents = new EventEmitter<TAppEvents>();

  protected isDetails: boolean = false;
  private _destroy$: Subject<void> = new Subject<void>();

  constructor(private _moviesService: MoviesService) {

  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  protected onDetails(): void {
    this.isDetails = !this.isDetails;
  }

  protected onEdit(): void {
    this.appEvents.emit({type: AppEvents.EDIT, value: this.movie.id});
  }

  protected onDelete(): void {
    this._moviesService.removeMovie(this.movie.id).pipe(
      takeUntil(this._destroy$)
    ).subscribe();
    // this._moviesService.remove(this.movie.id).then(() => {
    //   this.appEvents.emit({type: AppEvents.UPDATE});
    // });
  }
}
