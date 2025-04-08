import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppEvents, MoviesService, TAppEvents, TMovies } from '../../services';

@Component({
  selector: 'app-movies-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movies-item.component.html',
  styleUrl: './movies-item.component.less'
})
export class MoviesItemComponent {
  @Input() movie!: TMovies;
  @Output() appEvents = new EventEmitter<TAppEvents>();

  protected isDetails: boolean = false;

  constructor(private _moviesService: MoviesService) {

  }

  protected onDetails(): void {
    this.isDetails = !this.isDetails;
  }

  protected onEdit(): void {
    this.appEvents.emit({type: AppEvents.EDIT, value: this.movie.id});
  }

  protected onDelete(): void {
    this._moviesService.remove(this.movie.id).then(() => {
      this.appEvents.emit({type: AppEvents.UPDATE});
    });
  }
}
