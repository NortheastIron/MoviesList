import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppEvents, MoviesService, TAppEvents, TMovies } from '../../services';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-movies-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movies-item.component.html',
  styleUrl: './movies-item.component.less'
})
export class MoviesItemComponent implements OnDestroy {
  @Input() movie!: TMovies;
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
    ).subscribe({
      next: res => {
        console.log('remove res', res);
      }
    })
    // this._moviesService.remove(this.movie.id).then(() => {
    //   this.appEvents.emit({type: AppEvents.UPDATE});
    // });
  }
}
