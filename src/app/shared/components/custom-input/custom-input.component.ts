import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './custom-input.component.html',
  styleUrl: './custom-input.component.less'
})
export class CustomInputComponent {

  @Input() value: string = '';
  @Input() appPlaceholder: string = '';
  @Output() valueChange = new EventEmitter<string>();

  protected onValueChange(model: string): void {
    this.value = model;
    this.valueChange.emit(model);    
  }
}
