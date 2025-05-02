import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppEvents, ModalService, TAppEvents } from '@core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.less'
})
export class ModalComponent {
  //вся эта модалка пока что просто затычка ...нужно что то более глобальное и абстрактное
  // по хорошему надо сделать чтобы был как хеадер, так и фуутер с кнопками
  @Input() appTitle: string = 'Modal form';
  @Output() appEvents = new EventEmitter<TAppEvents>();

  constructor (private _modalService: ModalService) {}

  protected onClose(): void {
    this._modalService.close();
    this.appEvents.emit({type: AppEvents.CLOSE});
  }

}
