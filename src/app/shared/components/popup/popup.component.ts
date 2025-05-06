import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  Renderer2,
  ViewChild
} from '@angular/core';
import { PopupPositions } from '@shared/components/popup/enums/popup-positions.enum';
import { TSpace } from '@shared/components/popup/models/space.type';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [],
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.less'
})
export class PopupComponent implements OnDestroy {
  // в данной компоненте на старте слишком много проверок на элементы и setTimeout...
  //верно ли, но хочу точно убедиться что все есть и попап верно инициализировался учитывая содержимое контента
  // да в текущей реализации инит вызывается несколько раз, но сейчас это не критично
  // так как инпуты всё равно будут раньшь нгафтервьюинит, то в нём нет смысла ...ждём все элементы
  // popup отобразится в любом случае, можно поставить стрикт на родителе
  @Input()
  set parentRef(elementRef: ElementRef) {
    if (elementRef) {
      this._parentElement = elementRef.nativeElement;
      this._initPopupPosition();
    }
  }

  @Input() minHeight: number | undefined;
  @Input() maxHeight: number | undefined;

  @ViewChild('popup', { static: false })
  set popupElement(popupElement: ElementRef | undefined) {
    if (popupElement) {
      this._popupElement = popupElement.nativeElement;
      setTimeout(() => {
        this._initObservers();
        // this._initPopupPosition();
      });
    }
  }

  @HostListener('window:resize')
  onWindowChange(): void {
    this._initPopupPosition();
  }

  private _popupElement: HTMLElement | null = null;
  private _parentElement: HTMLElement | null = null;
  private _mainHeaderHeight: number = 72;
  private _resizeObserver!: ResizeObserver;

  constructor(private _render: Renderer2) {}

  public ngOnDestroy(): void {
    this._resizeObserver?.disconnect();
  }

  private _initObservers() {
    if (!this._popupElement) {
      return;
    }

    // 2 перерисовки подряд при изменении размера содержимого ...изза установки значений в 0
    // чтобы определить дефолтное значение размеров ... надо в общем улучшить
    // также будет 2 перерисовки со старта если установится скролл
    this._resizeObserver = new ResizeObserver(() => {
        this._initPopupPosition();
    });
    this._resizeObserver.observe(this._popupElement);
  }

  private _initPopupPosition(): void {
    const _popupElement = this._popupElement;
    const _parentElement = this._parentElement;


    if (!_popupElement || !_parentElement) {
      return;
    }

    const hostRect = _parentElement.getBoundingClientRect();
    const popupRect = _popupElement.getBoundingClientRect();
    const space: TSpace = {
      top: Math.max(hostRect.top - this._mainHeaderHeight - 10, 0), //10 = 5 от края + 5 от родителя
      bottom: Math.max(window.innerHeight - hostRect.bottom - 10, 0)
    };

    const position: PopupPositions = this._getPosition(popupRect.height, space);
    const baseAvailableSpace: number = position === PopupPositions.bottom ? space.bottom : space.top;
    const custPopupHeight: number = this._getAvailablePopupHeight(baseAvailableSpace);
    
    const top: number = position === PopupPositions.bottom 
    ? hostRect.bottom + 5
    : hostRect.top - custPopupHeight - 5;

    this._setPopupPosition(top, hostRect.left, custPopupHeight);
  }

  private _getPosition(popupHeight: number, space: TSpace): PopupPositions {
    const canFitBottom = space.bottom > popupHeight;
    const hasMoreSpaceBelow = space.bottom > space.top;

    return canFitBottom || hasMoreSpaceBelow ? PopupPositions.bottom : PopupPositions.top;
  }

  private _getAvailablePopupHeight(baseAvailableSpace: number): number {
    const { minHeight, maxHeight, _popupElement }  = this;

    this._render.setStyle(_popupElement, 'max-height', 'none');
    
    const naturalHeight = _popupElement!.offsetHeight;
    let custPopupHeight = naturalHeight;

    if (custPopupHeight > baseAvailableSpace) {
        custPopupHeight = baseAvailableSpace;
    }

    if (maxHeight !== undefined && custPopupHeight > maxHeight) {
        custPopupHeight = maxHeight;
    }

    if (minHeight !== undefined && custPopupHeight < minHeight) {
        custPopupHeight = minHeight;
    }

    return custPopupHeight;
  }

  private _setPopupPosition(top: number, left: number, height: number): void {
    const { _render, _popupElement } = this;

    _render.setStyle(_popupElement, 'top', `${top}px`);
    _render.setStyle(_popupElement, 'left', `${left}px`);
    _render.setStyle(_popupElement, 'max-height', `${height}px`);
  }
}
