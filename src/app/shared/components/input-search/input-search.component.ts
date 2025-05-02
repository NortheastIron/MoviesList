import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppEvents, TAppEvents } from '@core';
import { Subject, debounceTime, filter, map } from 'rxjs';

@Component({
  selector: 'app-input-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input-search.component.html',
  styleUrl: './input-search.component.less'
})
export class InputSearchComponent implements OnInit, OnDestroy {
  @Input() value: string = '';
  @Input() minLength: number = 1;
  @Output() appEvents = new EventEmitter<TAppEvents>();
  @Output() valueChange = new EventEmitter<string>();

  private searchString: string = '';
  private searchSubject = new Subject<string>();

  constructor() {}
  
  public ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      map((value: string) => value.length >= this.minLength ? value : ''),
      filter((val)=> val !== this.searchString),
    ).subscribe((searchValue) => {
      if (this.searchString !== searchValue) {
        this.onSearch(searchValue);
      }
    });
  }

  public ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  protected onValueChange(model: string): void {
      this.value = model;
      this.valueChange.emit(model);
      this.searchSubject.next(model);
      
  }

  protected onSearch(value: string = ''): void {
    this.searchString = value;
    this.appEvents.emit({type: AppEvents.SEARCH, value: value});
  }

}
