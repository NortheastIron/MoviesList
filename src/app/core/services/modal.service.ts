import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  private _isVisible$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  public get isVisible$(): Observable<boolean> {
    return this._isVisible$.asObservable();
  }

  public open(): void {
    this._isVisible$.next(true);
  }

  public close(): void {
    this._isVisible$.next(false);
  }
}