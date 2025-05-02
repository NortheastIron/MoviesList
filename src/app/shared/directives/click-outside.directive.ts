import { Directive, ElementRef, EventEmitter, HostListener, OnDestroy, Output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  standalone: true
})
export class ClickOutsideDirective implements OnDestroy {

  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) {}

  @HostListener('document:click', ['$event.target'])
  public onDocumentClick(targetElement: HTMLElement): void {
    const clickedInside: boolean = this.elementRef.nativeElement.contains(targetElement);

    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }

  ngOnDestroy(): void {
    this.clickOutside.complete();
  }

}