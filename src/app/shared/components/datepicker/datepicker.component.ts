import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, Renderer2, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AppEvents, TAppEvents } from '@core';
import { ClickOutsideDirective } from '@shared/directives';
import { PopupComponent } from '@shared/components/popup';
import { CalendarEvents } from '@shared/components/datepicker/enums';
import { getISOWeekNumber } from '@core/utils';
import { TCalendarEventParams } from '@shared/components/datepicker/models/calendar-event-params.type';
import { DatePickerTypes } from '@shared/components/datepicker';
import { TCalendarHeaderElement } from '@shared/components/datepicker/models/calendar-header-element.type';
import { CalendarNavigateTypes } from '@shared/components/datepicker/enums/calendar-navigate-types.enum';

const CALENDAR_MONTHS: string[] = [
  'January', 'February', 'March', 'April', 'May',
  'June', 'July', 'August', 'September',
  'October', 'November', 'December'
];

const CALENDAR_NAME_DAYS: string[] = [
  'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'
];

const DEFAULT_MAIN_ELEMENTS_CLASSES: string[] = [
  'calendar-main-box-hover',
  'calendar-main-box-pointer'
];

const CALENDAR_WEEK_NAME: string = 'W';

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [FormsModule, CommonModule, ClickOutsideDirective, PopupComponent],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.less'
})
export class DatepickerComponent implements OnDestroy {

  @Input()
  set value(value: string) {
    const inputValueInDate = new Date(value);
    const isValidDate = !isNaN(inputValueInDate.getDate());
    // nemnogo mydreno no reshil sdelat eto na slycai esli y nas format goda no infa prishla nevernaya
    this._value = isValidDate ? value : '';
    this.inputText = isValidDate
      ? this.type === DatePickerTypes.year
        ? `${inputValueInDate.getFullYear()}`
        : value
      : '';
  }

  get value(): string {
    // const ara: unknown = '1';
    return this._value;
  }

  @Input() appPlaceholder: string = 'Select date...';
  @Input() type: DatePickerTypes = DatePickerTypes.all;
  @Output() appEvents = new EventEmitter<TAppEvents>();
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('datepickerCalendarElement')
  set datePickerE(element: ElementRef) {
    if (element) {
      this._initCalendar(element);
    } else if (!element && !!this._datepickerCalendar) {
      this._destroyCalendar();
    }
  }

  protected inputText: string = '';
  protected calendarIsVisible: boolean = false;
  protected datePickerTypesEnum = DatePickerTypes;
  private _calendarSubscription: Subscription | undefined;
  private _datepickerCalendar: DatepickerCalendar | undefined;
  private _value: string = '';

  constructor(private _render: Renderer2, protected elementRef: ElementRef) {
  }

  public ngOnDestroy(): void {
    this._destroyCalendar();
  }

  protected onCalendar(): void {
    this.calendarIsVisible = !this.calendarIsVisible;
  }

  protected onPrev(): void {
    this._datepickerCalendar?.onPrev();
  }

  protected onNext(): void {
    this._datepickerCalendar?.onNext();
  }

  protected onReset(): void {
    this._configSelectedDate('');
  }

  protected onToday(): void {
    this._configSelectedDate(new Date());
  }

  protected onCloseCalendar(): void {
    this.calendarIsVisible = false;
  }

  private _initCalendar(element: ElementRef): void {
    this._datepickerCalendar = new DatepickerCalendar(this._render);
    this._calendarSubscription = this._datepickerCalendar.subscribe({
      next: (params: TCalendarEventParams) => {
        if (params.type === CalendarEvents.selected && params.value) {
          this._configSelectedDate(params.value);
        } else if (params.type === CalendarEvents.close) {
          this.onCloseCalendar();
        }
      }
    });

    this._datepickerCalendar.setPopupDate(this.value);
    this._datepickerCalendar.setElement(element.nativeElement);
    this._datepickerCalendar.setTypeCalendar(this.type);
    this._datepickerCalendar.createCalendar();
  }

  private _configSelectedDate(date: string | Date): void {
    const result = date instanceof Date
      ? this.type === DatePickerTypes.year
        ? `${date.getFullYear()}`
        : `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
      : date;

    this.inputText = result;
    this.valueChange.emit(result);
    this.appEvents.emit({type: AppEvents.SELECTED});
    this.onCloseCalendar();
  }

  // private _setInputText()

  private _destroyCalendar(): void {
    this._calendarSubscription?.unsubscribe();
    this._datepickerCalendar = undefined;
  }
}

class DatepickerCalendar extends EventEmitter {

  private _typeCalendar: DatePickerTypes = DatePickerTypes.all;
  private _element: HTMLElement | null = null;
  private _mainBox: Element | null = null;
  private _headerBox: Element | null = null;
  private _calendarNavType: CalendarNavigateTypes = CalendarNavigateTypes.date;
  private _numYearMonthBoxes: number = 12;
  private _calendarValue: Date | null = null;

  constructor(private _render: Renderer2) {
    super();
  }

  public setPopupDate(date: string | Date): void {
    if (date instanceof Date) {
      this._calendarValue = new Date(date);
      return;
    }

    const tempDate = new Date(date);
    this._calendarValue = tempDate.getTime() ? tempDate : new Date();
  }

  public setElement(element: HTMLElement): void {
    this._element = element;
    this._mainBox = element.querySelector('.app-datepicker__calendar-cont__main');
    this._headerBox = element.querySelector('.app-datepicker__calendar-cont__header__info');
  }

  public setTypeCalendar(newType: DatePickerTypes): void {
    this._typeCalendar = newType;
    if (newType === DatePickerTypes.year) {
      this._calendarNavType = CalendarNavigateTypes.year;
    }
  }

  public onNext(): void {
    this._updateCalendarValue(true);
    this._clearContent();
    this.createCalendar();
  }

  public onPrev(): void {
    this._updateCalendarValue(false);
    this._clearContent();
    this.createCalendar();
  }

  public createCalendar(): void {
    //if nije ... eto to choto ne dodymalsya napisat srazy .. vse dalshe nado refactorit teper ... ibo ochen mnogo proverok sdelal
    //da i v celom net varianta chto if yidet v false)))
    if (this._calendarValue instanceof Date) {
      this._makeHeader();
      this._makeMain();
    }
  }

  private _updateCalendarValue(direction: boolean): void {
    if (!this._calendarValue) {
      return;
    }

    const increment = direction ? 1 : -1;
    let newDate = this._calculateNewDate(increment);

    this.setPopupDate(newDate);
  }

  private _calculateNewDate(increment: number): Date {
    switch(this._calendarNavType) {
      case CalendarNavigateTypes.date:
        return this._adjustDateNavigation(increment);
      case CalendarNavigateTypes.month:
        return this._adjustMonthNavigation(increment);
      case CalendarNavigateTypes.year:
        return this._adjustYearNavigation(increment);
      default: 
        return this._calendarValue!;
    }
  }

  private _adjustDateNavigation(increment: number): Date {
    const [currentYear, currentMonth, currentDate] = this._getCalendarValues();
    const daysInNewMonth: number = this._getDaysInMonth(currentYear, currentMonth + increment);
    let adjustedDate: number = currentDate;

    if (increment > 0) {
      const daysInCurrentMonth: number = this._getDaysInMonth(currentYear, currentMonth);
      adjustedDate += daysInCurrentMonth;
    } else {
      adjustedDate -= daysInNewMonth;
    }

    if (currentDate > daysInNewMonth) {
      adjustedDate -= currentDate%daysInNewMonth;
    }
    return new Date(currentYear, currentMonth, adjustedDate);
  }

  private _getCalendarValues(): [number, number, number] {
    return [
        this._calendarValue!.getFullYear(),
        this._calendarValue!.getMonth(),
        this._calendarValue!.getDate()
    ];
}

  private _getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  private _adjustMonthNavigation(increment: number): Date {
    return new Date(
        this._calendarValue!.getFullYear() + increment,
        this._calendarValue!.getMonth(),
        this._calendarValue!.getDate()
    );
  }

  private _adjustYearNavigation(increment: number): Date {
    return new Date(
        this._calendarValue!.getFullYear() + increment * this._numYearMonthBoxes,
        this._calendarValue!.getMonth(),
        this._calendarValue!.getDate()
    );
  }

  private _makeMain(): void {
    const { _render, _mainBox, _calendarNavType } = this;

    if (!_mainBox || !this._calendarValue) {
      return;
    }

    _render.removeClass(_mainBox, 'date-mode');
    _render.removeClass(_mainBox, 'year-month-mode');
    _render.addClass(_mainBox, _calendarNavType === CalendarNavigateTypes.date ? 'date-mode' : 'year-month-mode');

    const elements: HTMLElement[] = this._chooseCalendarMainElements();

    elements.forEach(element => {
      _render.appendChild(_mainBox, element);
    })
  }

  private _chooseCalendarMainElements(): HTMLElement[] {
    let elements: HTMLElement[] = [];

    switch(this._calendarNavType) {
      case CalendarNavigateTypes.date:
        elements = this._getCalendarMainElementsDates();
        break;
      case CalendarNavigateTypes.month:
        elements = this._getCalendarMainElementsMonths();
        break;
      case CalendarNavigateTypes.year:
        elements = this._getCalendarMainElementsYears();
        break;
      default:
        break;
    }

    return elements;
  }

  private _getCalendarMainElementsDates(): HTMLElement[] {
    const currentDate = this._calendarValue;
    const currentMonth = currentDate!.getMonth();
    const elements: HTMLElement[] = [];
    const el = this._createMainElement({name: CALENDAR_WEEK_NAME});
    elements.push(el);

    CALENDAR_NAME_DAYS.forEach((value) => {
      const element = this._createMainElement({name: value});
      elements.push(element);
    });

    const monthStart = new Date(currentDate!.getFullYear(), currentDate!.getMonth());
    const startDate = new Date(currentDate!.getFullYear(), currentDate!.getMonth(), 1 - ((monthStart.getDay() || 7) - 1));
    const currentDateTimestamp = new Date(currentDate!).setHours(0, 0, 0, 0);
    const todayTimestamp = new Date().setHours(0, 0, 0, 0);

    do {
      let weekElement = this._createWeekNumElement(startDate); 
      elements.push(weekElement);

      for(let i = 0; i < 7; i++) {
        let dayElement = this._createDayElement(startDate, currentMonth, currentDateTimestamp, todayTimestamp);
        
        elements.push(dayElement);
        startDate.setDate(startDate.getDate() + 1);
      }
    } while(startDate.getMonth() === currentMonth)

    return elements;
  }

  private _createWeekNumElement(date: Date): HTMLElement {
    const weekNum = getISOWeekNumber(date);
    return this._createMainElement({name: `${weekNum}`});
  }

  private _createDayElement(
    date: Date,
    currentMonth: number,
    currentDateTimestamp: number,
    todayTimestamp: number
  ) {
    const boxClasses = [...DEFAULT_MAIN_ELEMENTS_CLASSES];

    if (date.getMonth() !== currentMonth) {
      boxClasses.push('calendar-main-box-another');
    }

    if (date.getTime() === currentDateTimestamp) {
      boxClasses.push('calendar-main-box-enabled');
    }

    if (date.getTime() === todayTimestamp) {
      boxClasses.push('calendar-main-box-today');
    }
    const element = this._createMainElement(
      {name: `${date.getDate()}`, key: `${date.getDate()}-${date.getMonth()}`},
      boxClasses
    );

    return element;
  }

  private _createMainElement(options: {name: string, key?: string}, classes?: string[]): HTMLElement {
    const _render = this._render;
    const element = _render.createElement('div') as HTMLElement;

    _render.addClass(element, 'calendar-main-box');

    classes?.forEach(cls => {
      _render.addClass(element, cls);
    });
    _render.setProperty(element, 'textContent', options.name);

    if (options.key) {
      _render.listen(element, 'click', ($event: Event) => {
        $event.stopPropagation();
        this._onMainSelected(options.key!);
      });
    }

    return element;
  }

  private _getCalendarMainElementsMonths(): HTMLElement[] {
    const currentDate = this._calendarValue;
    const currentMonth = currentDate!.getMonth();
    const startDate = new Date(currentDate!.getFullYear(), 0, 1);
    const todayDate = new Date();
    const elements: HTMLElement[] = [];

    for (let i = 0; i < 12; i++) {
      const monthElement = this._createMonthElement(startDate, currentMonth, todayDate);
      elements.push(monthElement);
      startDate.setMonth(startDate.getMonth() + 1);
    }

    return elements;
  }

  private _createMonthElement(
    date: Date,
    currentMonth: number,
    todayDate: Date
  ) {
    const boxClasses = [...DEFAULT_MAIN_ELEMENTS_CLASSES];

    if (date.getMonth() === currentMonth) {
      boxClasses.push('calendar-main-box-enabled');
    }
    if ((date.getMonth() === todayDate.getMonth()) && (date.getFullYear() === todayDate.getFullYear())) {
      boxClasses.push('calendar-main-box-today');
    }
    const element = this._createMainElement(
      {name: `${CALENDAR_MONTHS[date.getMonth()].slice(0, 3)}`, key: `${date.getMonth()}`},
      boxClasses
    );

    return element;
  }

  private _getCalendarMainElementsYears(): HTMLElement[] {
    const currentDate = this._calendarValue;
    const currentYear = currentDate!.getFullYear();
    const todayYear = new Date().getFullYear();
    const elements: HTMLElement[] = [];
    let startYear = currentYear - currentYear%12;

    for (let i = 0; i < 12; i++) {
      const yearElement = this._createYearElement(startYear, currentYear, todayYear);
      elements.push(yearElement);
      startYear++;
    }

    return elements;
  }

  private _createYearElement(
    workYear: number,
    currentYear: number,
    todayYear: number
  ) {
    const boxClasses = [...DEFAULT_MAIN_ELEMENTS_CLASSES];

    if (workYear === currentYear) {
      boxClasses.push('calendar-main-box-enabled');
    }

    if (workYear === todayYear) {
      boxClasses.push('calendar-main-box-today');
    }
    const element = this._createMainElement(
      {name: `${workYear}`, key: `${workYear}`},
      boxClasses
    );

    return element;
  }

  //need refact
  private _makeHeader(): void {
    const { _render, _typeCalendar, _headerBox, _calendarValue } = this;

    _render.addClass(_headerBox, _typeCalendar === DatePickerTypes.year ? 'single-box' : 'multi-box');

    if (_typeCalendar === DatePickerTypes.year) {
      // doraborka v poslednii moment ...iznachalno dymal tak sdelat.. no ya v etoi componente yje live)
      // ostavlu poka tak
      const currentYear: number = _calendarValue!.getFullYear();
      const startYear: number = currentYear - currentYear%12;
      const endYear: number = startYear + 11;
      // const year: HTMLElement = this._createHeaderElement(CalendarNavigateTypes.year, `${_calendarValue?.getFullYear() ?? ''}`);

      const years: HTMLElement = this._createHeaderElement(CalendarNavigateTypes.year, `${startYear} - ${endYear}`);
      _render.appendChild(_headerBox, years);
    } else {

      const elements: TCalendarHeaderElement[] = [
        { type: CalendarNavigateTypes.date, value: `${_calendarValue?.getDate() ?? ''}` },
        { type: CalendarNavigateTypes.month, value: this._getMonthName() },
        { type: CalendarNavigateTypes.year, value: `${_calendarValue?.getFullYear() ?? ''}` }
      ];

      elements.forEach(({ type, value }) => {
        const element = this._createHeaderElement(type, value);

        if (this._calendarNavType === type) {
          _render.addClass(element, 'calendar-box-enabled');
        }

        _render.appendChild(_headerBox, element);
      });
    }
  }

  private _createHeaderElement(type: CalendarNavigateTypes, value: string): HTMLElement {
    const _render = this._render;
    const element = _render.createElement('div') as HTMLElement;

    _render.addClass(element, 'calendar-info-box');
    _render.setProperty(element, 'textContent', value);
    _render.listen(element, 'click', ($event: Event) => {
      $event.stopPropagation();
      this._onNavigate(type);
    });

    return element;
  }

  //need refact
  private _getMonthName(): string {
    if (!this._calendarValue) {
      return '';
    }
    return CALENDAR_MONTHS[this._calendarValue.getMonth()] ?? '';
  }

  private _onNavigate(type: CalendarNavigateTypes): void {
    if (type === this._calendarNavType) {
      return;
    }
    this._calendarNavType = type;
    this._clearContent();
    this.createCalendar();
  }

  private _clearContent(): void {
    const _render = this._render;

    _render.setProperty(this._headerBox, 'textContent', '');
    _render.setProperty(this._mainBox, 'textContent', '');
  }

  private _onMainSelected(key: string) {
    const _calendarNavType = this._calendarNavType;
    const newDate = new Date(this._calendarValue!);

    switch (_calendarNavType) {
      case (CalendarNavigateTypes.date):
        const [date, month] = key.split('-').map(Number);
        newDate.setMonth(month);
        newDate.setDate(date);
        this._returnSelectedDate(newDate);
        break;
      case (CalendarNavigateTypes.month):
      case (CalendarNavigateTypes.year):
        if (_calendarNavType === CalendarNavigateTypes.month) {
          newDate.setMonth(+key);
        } else {
          newDate.setFullYear(+key);
        }

        if (this._typeCalendar === DatePickerTypes.year) {
          this._returnSelectedDate(newDate);
          break;
        }
        this.setPopupDate(newDate);
        this._onNavigate(CalendarNavigateTypes.date);
        break;
      default:
        break;
    }
  }

  private _returnSelectedDate(date: Date): void {
    this.emit({type: CalendarEvents.selected, value: date});
  }

  private _closeCalendar(): void {
    this.emit({type: CalendarEvents.close});
  }
}
