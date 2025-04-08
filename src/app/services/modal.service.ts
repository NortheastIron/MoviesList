import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

export interface IModalService {
    readonly isVisible$: Observable<boolean>;
    open(): void;
    close(): void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService implements IModalService {

  public readonly isVisible$: Observable<boolean>;
  private _isVisible$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.isVisible$ = this._isVisible$.asObservable();
  }

  public open(): void {
    this._isVisible$.next(true);
  }

  public close(): void {
    this._isVisible$.next(false);
  }
}