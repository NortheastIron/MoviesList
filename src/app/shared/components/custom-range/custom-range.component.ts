import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

// данный тип вынести, но для этого должна быть в целом другая компонента
type TPopupPosition = {
  x: number;
  y: number;
};
// сам по себе input range не самое лучшее решение ...стили сложно поддаются и не хочется прибегать к вебкиту
// можно будет позже попробовать чисто с 0 написать, но надо ли
@Component({
  selector: 'app-custom-range',
  standalone: true,
  imports: [FormsModule, CommonModule, DecimalPipe],
  templateUrl: './custom-range.component.html',
  styleUrl: './custom-range.component.less'
})
export class CustomRangeComponent {
  @Input() value!: number;
  @Output() valueChange = new EventEmitter<number>();

  protected isDragging: boolean = false;
  protected popupPosition: TPopupPosition = {x: 0, y: 0};

  protected stopDragging(): void {
    this.isDragging = false;
  }

  protected onValueChange(model: number): void {
    this.value = model;
    this.valueChange.emit(model);    
  }

  protected startDragging(event: TouchEvent | MouseEvent): void {
    this.isDragging = true;
    this.updatePopupPosition(event);
  }

  protected updatePopup(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = parseFloat(input.value);
    
    if (this.isDragging) {
      this.updatePopupPosition(event as TouchEvent | MouseEvent);
    }
  }

  private updatePopupPosition(event: TouchEvent | MouseEvent): void {
    const input = event.target as HTMLInputElement;
    const rect: DOMRect = input.getBoundingClientRect();
    const percentage: number = (parseFloat(input.value) / 10) * 100;
    //центровал примерно по середине
    this.popupPosition = {
      x: rect.left + 8 + ((rect.width - 16) * percentage / 100),
      y: rect.top
    };
  }
}
