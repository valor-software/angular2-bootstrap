import { Injectable } from '@angular/core';
import {
  DatepickerRenderOptions,
  BsDatepickerViewMode,
  DatepickerDateCustomClasses,
  DatepickerDateTooltipText
} from './models';
import { BsCustomDates } from './themes/bs/bs-custom-dates-view.component';


/**
 * For date range picker there are `BsDaterangepickerConfig` which inherits all properties,
 * except `displayMonths`, for range picker it default to `2`
 */
@Injectable({
  providedIn: 'root'
})
export class BsDatepickerConfig implements DatepickerRenderOptions {
  /** sets use adaptive position */
  adaptivePosition = false;
  /** sets use UTC date time format */
  useUtc = false;
  /** turn on/off animation */
  isAnimated = false;
  value?: Date | Date[];
  isDisabled?: boolean;
  /**
   * Default min date for all date/range pickers
   */
  minDate?: Date;
  /**
   * Default max date for all date/range pickers
   */
  maxDate?: Date;
  /**
   * The view that the datepicker should start in
   */
  startView: BsDatepickerViewMode = 'day';
  /**
   * Default date custom classes for all date/range pickers
   */
  dateCustomClasses?: DatepickerDateCustomClasses[];
  /**
   * Default tooltip text for all date/range pickers
   */
  dateTooltipTexts?: DatepickerDateTooltipText[];
  /**
   * Disable specific days, e.g. [0,6] will disable all Saturdays and Sundays
   */
  daysDisabled?: number[];
  /**
   * Disable specific dates
   */
  datesDisabled?: Date[];
  /**
   * Show one months for special cases (only for dateRangePicker)
   * 1. maxDate is equal to today's date
   * 2. minDate's month is equal to maxDate's month
   */
  displayOneMonthRange?: boolean;
  /**
   * Enable specific dates
   */
  datesEnabled?: Date[];
  /**
   * Makes dates from other months active
   */
  selectFromOtherMonth?: boolean;

  /**
   * Allows select first date of the week by click on week number
   */
  selectWeek?: boolean;

  /**
   * Allows select daterange as first and last day of week by click on week number (dateRangePicker only)
   */
  selectWeekDateRange?: boolean;

  /**
   * Shows previous and current month, instead of current and next (dateRangePicker only)
   */
  showPreviousMonth?: boolean;

  /**
   * Prevents change to next month for right calendar in two calendars view (dateRangePicker only)
   */
  preventChangeToNextMonth?: boolean;

  /**
   * Add class to current day
   */
  customTodayClass?: string;

  /**
   * Default mode for all date pickers
   */
  minMode?: BsDatepickerViewMode;

  /**
   * If true, returns focus to the datepicker / daterangepicker input after date selection
   */
  returnFocusToInput = false;

  /** CSS class which will be applied to datepicker container,
   * usually used to set color theme
   */
  containerClass = 'theme-green';

  // DatepickerRenderOptions
  displayMonths = 1;
  /**
   * Allows to hide week numbers in datepicker
   */
  showWeekNumbers = true;

  dateInputFormat = 'L';
  // range picker
  rangeSeparator = ' - ';
  /**
   * Date format for date range input field
   */
  rangeInputFormat = 'L';

  /**
   * Predefined ranges
   */
  ranges?: BsCustomDates[];

  /**
   * Max Date Range in days
   */
  maxDateRange?: number;

  // DatepickerFormatOptions
  monthTitle = 'MMMM';
  yearTitle = 'YYYY';
  dayLabel = 'D';
  monthLabel = 'MMMM';
  yearLabel = 'YYYY';
  weekNumbers = 'w';

  /**
   * Shows 'today' button
   */
  showTodayButton = false;

  /**
   * Shows clear button
   */
  showClearButton = false;
  /**
   * CustomDate clear button
   */
  customDateButton?: Date = undefined;

  /**
   * Positioning of 'today' button
   */
  todayPosition = 'center';
  /**
   * Positioning of 'today' button
   */
  customPosition = 'left';

  /**
   * Positioning of 'clear' button
   */
  clearPosition = 'right';

  /**
   * Label for 'today' button
   */
  todayButtonLabel = 'Today';

  /**
   * Label for 'clear' button
   */
  clearButtonLabel = 'Clear';
  /**
   * Label for custom Button
   */
  customButtonLabel = 'Custom Date';

  /**
   * Label for 'custom range' button
   */
  customRangeButtonLabel = 'Custom Range';
}
