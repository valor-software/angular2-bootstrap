// datepicker container component
import { BsCustomDates } from '../themes/bs/bs-custom-dates-view.component';
import { BsDatepickerEffects } from '../reducer/bs-datepicker.effects';
import { Observable, Subscription } from 'rxjs';
import {
  BsDatepickerViewMode,
  BsNavigationEvent,
  CalendarCellViewModel,
  CellHoverEvent,
  DatepickerRenderOptions,
  DatepickerDateCustomClasses,
  DatepickerDateTooltipText,
  DaysCalendarViewModel,
  DayViewModel,
  MonthsCalendarViewModel,
  WeekViewModel,
  YearsCalendarViewModel
} from '../models';

export abstract class BsDatepickerAbstractComponent {
  containerClass = '';
  isOtherMonthsActive?: boolean;
  showTodayBtn?: boolean;
  todayBtnLbl?: string;
  todayPos?: string;
  showClearBtn?: boolean;
  clearBtnLbl?: string;
  clearPos?: string;
  customDateBtn?: Date;
  customBtnLabel?: string;
  customBtnPos?: string;


  _effects?: BsDatepickerEffects;
  customRanges: BsCustomDates[] = [];
  customRangeBtnLbl?: string;
  chosenRange: Date[] = [];

  multipleCalendars?: boolean;

  set minDate(value: Date|undefined) {
    this._effects?.setMinDate(value);
  }

  set maxDate(value: Date|undefined) {
    this._effects?.setMaxDate(value);
  }
  set daysDisabled(value: number[]|undefined) {
    this._effects?.setDaysDisabled(value);
  }
  set datesDisabled(value: Date[]|undefined) {
    this._effects?.setDatesDisabled(value);
  }

  set datesEnabled(value: Date[]|undefined) {
    this._effects?.setDatesEnabled(value);
  }

  set isDisabled(value: boolean|undefined) {
    this._effects?.setDisabled(value);
  }

  set dateCustomClasses(value: DatepickerDateCustomClasses[]|undefined) {
    this._effects?.setDateCustomClasses(value);
  }

  set dateTooltipTexts(value: DatepickerDateTooltipText[]|undefined) {
    this._effects?.setDateTooltipTexts(value);
  }

  viewMode?: Observable<BsDatepickerViewMode|undefined>;
  monthsCalendar?: Observable<MonthsCalendarViewModel[]|undefined>;
  yearsCalendar?: Observable<YearsCalendarViewModel[]|undefined>;
  options$!: Observable<DatepickerRenderOptions|undefined>;

  _daysCalendar$!: Observable<DaysCalendarViewModel[]|undefined>;
  _daysCalendarSub = new Subscription();

  set daysCalendar$(value: Observable<DaysCalendarViewModel[]|undefined>) {
    this._daysCalendar$ = value;
    this._daysCalendarSub.unsubscribe();
    this._daysCalendarSub.add(this._daysCalendar$.subscribe(value => {
      this.multipleCalendars = !!value && value.length > 1;
    }));
  }

  get daysCalendar$(): Observable<DaysCalendarViewModel[]|undefined> {
    return this._daysCalendar$;
  }


  // todo: valorkin fix
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  setViewMode(event: BsDatepickerViewMode): void {}

  // eslint-disable-next-line
  navigateTo(event: BsNavigationEvent): void {}

  // eslint-disable-next-line
  dayHoverHandler(event: CellHoverEvent): void {}

  // eslint-disable-next-line
  weekHoverHandler(event: WeekViewModel): void {}

  // eslint-disable-next-line
  monthHoverHandler(event: CellHoverEvent): void {}

  // eslint-disable-next-line
  yearHoverHandler(event: CellHoverEvent): void {}

  // eslint-disable-next-line
  daySelectHandler(day: DayViewModel): void {}

  // eslint-disable-next-line
  monthSelectHandler(event: CalendarCellViewModel): void {}

  // eslint-disable-next-line
  yearSelectHandler(event: CalendarCellViewModel): void {}

  // eslint-disable-next-line
  setRangeOnCalendar(dates: BsCustomDates): void {}

  // eslint-disable-next-line
  setToday(): void {}

  // eslint-disable-next-line
  clearDate(): void {}

  // eslint-disable-next-line
  setCustomDate(): void {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _stopPropagation(event: any): void {
    event.stopPropagation();
  }
}
