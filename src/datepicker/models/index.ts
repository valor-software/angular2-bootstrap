import { Locale } from '../../bs-moment/locale/locale.class';
import { TimeUnit } from '../../bs-moment/types';

export interface DaysCalendarModel {
  daysMatrix: Date[][];
  month: Date;
}

export interface DayViewModel {
  date: Date;
  label: string;
  // flag step
  isDisabled?: boolean;
  isHovered?: boolean;
  isOtherMonth?: boolean;
  isInRange?: boolean;
  isSelectionStart?: boolean;
  isSelectionEnd?: boolean;
  isSelected?: boolean;
  // day index
  monthIndex?: number;
  weekIndex?: number;
  dayIndex?: number;
}

export interface WeekViewModel {
  days: DayViewModel[];
}

export interface MonthViewModel {
  weeks: WeekViewModel[];
  // format step
  month: Date;
  monthTitle: string;
  yearTitle: string;
  weekNumbers: string[];
  weekdays: string[];
  // flag step
  hideLeftArrow?: boolean;
  hideRightArrow?: boolean;
}

export interface MonthViewOptions {
  width?: number;
  height?: number;
  firstDayOfWeek?: number;
}

export interface DatepickerFormatOptions {
  locale: string;
  monthTitle: string;
  yearTitle: string;
  dayLabel: string;
  weekNumbers: string;
}

export interface DatepickerRenderOptions {
  showWeekNumbers?: boolean;
  displayMonths?: number;
}

export type DateFormatterFn = (date: Date, format: string, locale?: Locale) => string;

// events

export interface BsNavigationEvent {
  step: TimeUnit;
}

export interface DayHoverEvent {
  day: DayViewModel;
  isHovered: boolean;
}
