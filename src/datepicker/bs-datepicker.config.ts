import { Injectable } from '@angular/core';
import {
  DatepickerFormatOptions,
  DatepickerRenderOptions
} from './models/index';

@Injectable()
export class BsDatepickerConfig
  implements DatepickerRenderOptions {
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
  rangeInputFormat = 'L';

  // DatepickerFormatOptions
  monthTitle = 'MMMM';
  yearTitle = 'YYYY';
  dayLabel = 'D';
  monthLabel = 'MMMM';
  yearLabel = 'YYYY';
  weekNumbers = 'w';
}
