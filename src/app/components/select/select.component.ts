import { 
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { AppEvents, TAppEvents } from '../../services';
import { PopupComponent } from "../popup/popup.component";

export type TDict = {
  key: number | string;
  name: string;
};

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [FormsModule, CommonModule, ClickOutsideDirective, PopupComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.less'
})
export class SelectComponent implements OnChanges {

  @Input() appPlaceholder: string = 'Select ...';
  @Input({required: true}) value: number | string = '';
  @Input({required: true}) dicts: TDict[] = [];

  @Output() valueChange = new EventEmitter<string | number>();
  @Output() appEvents = new EventEmitter<TAppEvents>();

  protected inputText: string = '';
  protected isVisiblePopup: boolean = false;

  constructor(protected elementRef: ElementRef) {}
  
  public ngOnChanges(changes: SimpleChanges): void {
    if (Object.prototype.hasOwnProperty.call(changes, 'value')) {
      const tempItem: TDict | undefined = this.dicts.find(dict => dict.key === this.value);
      if (tempItem) {
        this.inputText = tempItem.name;
      }
    }
  }

  protected onPopup(val: boolean): void {
    if (val) {
      this.isVisiblePopup = !this.isVisiblePopup;
    } else {
      this.isVisiblePopup = false;
    }
  }

  protected onSelected(item: TDict): void {
    this.valueChange.emit(item.key);
    this.appEvents.emit({type: AppEvents.SELECTED});
  }
}
