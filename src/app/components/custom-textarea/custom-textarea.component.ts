import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-textarea',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './custom-textarea.component.html',
  styleUrl: './custom-textarea.component.less'
})
export class CustomTextareaComponent {

  @Input() value: string = '';
  @Input() appPlaceholder: string = '';
  @Output() valueChange = new EventEmitter<string>();

  protected onValueChange(model: string): void {
    this.value = model;
    this.valueChange.emit(model);    
  }

}
