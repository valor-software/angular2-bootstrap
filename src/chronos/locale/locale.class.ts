import { weekOfYear } from '../units/week-calendar-utils';
import { hasOwnProp, isArray, isFunction } from '../utils/type-checks';
import { getDay, getMonth, getFullYear } from '../utils/date-getters';
import { matchWord, regexEscape } from '../parse/regex';
import { setDayOfWeek } from '../units/day-of-week';

export interface LocaleOptionsFormat {
  format: string[];
  standalone: string[];
  isFormat?: RegExp;
}

export type LocaleOptions = string[] | LocaleOptionsFormat;

const MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
export const defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split(
  '_'
);
export const defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split(
  '_'
);
export const defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split(
  '_'
);
export const defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split(
  '_'
);
export const defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
export const defaultLongDateFormat: { [index: string]: string } = {
  LTS: 'h:mm:ss A',
  LT: 'h:mm A',
  L: 'MM/DD/YYYY',
  LL: 'MMMM D, YYYY',
  LLL: 'MMMM D, YYYY h:mm A',
  LLLL: 'dddd, MMMM D, YYYY h:mm A'
};

export const defaultOrdinal = '%d';
export const defaultDayOfMonthOrdinalParse = /\d{1,2}/;

const defaultMonthsShortRegex = matchWord;
const defaultMonthsRegex = matchWord;

export type OrdinalDateFn = (num: number, token?: string) => string;
export type PluralizeDateFn = (num: number, withoutSuffix: boolean,
                               key?: string, isFuture?: boolean) => string;

export interface LocaleData {
  abbr?: string;
  parentLocale?: string;

  months?: LocaleOptions | ((date: Date, format: string, isUTC?: boolean) => string | string[]);
  monthsShort?: LocaleOptions | ((date: Date, format: string, isUTC?: boolean) => string | string[]);
  monthsParseExact?: boolean;

  weekdays?: LocaleOptions | ((date: Date, format: string, isUTC?: boolean) => string | string[]);
  weekdaysShort?: string[] | ((date: Date, format: string, isUTC?: boolean) => string | string[]);
  weekdaysMin?: string[] | ((date: Date, format: string, isUTC?: boolean) => string | string[]);
  weekdaysParseExact?: boolean;

  longDateFormat?: { [index: string]: string };
  calendar?: {
    [key: string]: (string
      | ((date: Date, now?: Date) => string)
      | ((dayOfWeek: number, isNextWeek: boolean) => string))
  };
  relativeTime?: { [key: string]: string | PluralizeDateFn };
  dayOfMonthOrdinalParse?: RegExp;
  ordinal?: string | OrdinalDateFn;

  week?: { dow?: number; doy?: number };

  invalidDate?: string;

  monthsRegex?: RegExp;
  monthsParse?: RegExp[];
  monthsShortRegex?: RegExp;
  monthsStrictRegex?: RegExp;
  monthsShortStrictRegex?: RegExp;
  longMonthsParse?: RegExp[];
  shortMonthsParse?: RegExp[];

  meridiemParse?: RegExp;

  meridiemHour?(hour: number, meridiem: string): number;

  preparse?(str: string, format?: string | string[]): string;

  postformat?(str: string | number): string;

  meridiem?(hour: number, minute?: number, isLower?: boolean): string;

  isPM?(input: string): boolean;

  getFullYear?(date: Date, isUTC: boolean): number;
}

export class Locale {
  parentLocale?: Locale;
  _abbr: string;
  _config: LocaleData;
  meridiemHour: (hour: number, meridiem: string) => number;

  _invalidDate: string;
  _week: { dow: number; doy: number };
  _dayOfMonthOrdinalParse: RegExp;
  _ordinalParse: RegExp;
  _meridiemParse: RegExp;

  private _calendar: { [key: string]: string };
  private _relativeTime: { future: string; past: string };
  private _months: LocaleOptions;
  private _monthsShort: LocaleOptions;
  private _monthsRegex: RegExp;
  private _monthsShortRegex: RegExp;
  private _monthsStrictRegex: RegExp;
  private _monthsShortStrictRegex: RegExp;
  private _monthsParse: RegExp[];
  private _longMonthsParse: string[] | RegExp[];
  private _shortMonthsParse: string[] | RegExp[];
  private _monthsParseExact: RegExp;
  private _weekdaysParseExact: boolean;
  private _weekdaysRegex: RegExp;
  private _weekdaysShortRegex: RegExp;
  private _weekdaysMinRegex: RegExp;

  private _weekdaysStrictRegex: RegExp;
  private _weekdaysShortStrictRegex: RegExp;
  private _weekdaysMinStrictRegex: RegExp;

  private _weekdays: LocaleOptions;
  private _weekdaysShort: string[];
  private _weekdaysMin: string[];
  private _weekdaysParse: string[] | RegExp[];
  private _minWeekdaysParse: string[] | RegExp[];
  private _shortWeekdaysParse: string[] | RegExp[];
  private _fullWeekdaysParse: RegExp[];
  private _longDateFormat: { [key: string]: string };

  private _ordinal: string;

  constructor(config: LocaleData) {
    if (config) {
      this.set(config);
    }
  }

  set(config: LocaleData): void {
    let confKey;
    for (confKey in config) {
      // eslint-disable-next-line no-prototype-builtins
      if (!config.hasOwnProperty(confKey)) {
        continue;
      }
      const prop = config[confKey as keyof LocaleData];
      const key = (isFunction(prop) ? confKey : `_${confKey}`) as keyof Locale;

      this[key] = prop as any;
    }

    this._config = config;
  }

  calendar(key: string, date: Date, now: Date): string {
    const output = this._calendar[key] || this._calendar.sameElse;

    return isFunction(output) ? output.call(null, date, now) : output;
  }

  longDateFormat(key: string) {
    const format = this._longDateFormat[key];
    const formatUpper = this._longDateFormat[key.toUpperCase()];

    if (format || !formatUpper) {
      return format;
    }

    this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val: string) {
      return val.slice(1);
    });

    return this._longDateFormat[key];
  }

  get invalidDate(): string {
    return this._invalidDate;
  }

  set invalidDate(val: string) {
    this._invalidDate = val;
  }

  ordinal(num: number, token?: string): string {
    return this._ordinal.replace('%d', num.toString(10));
  }

  preparse(str: string, format?: string | string[]) {
    return str;
  }


  getFullYear(date: Date, isUTC = false): number {
    return getFullYear(date, isUTC);
  }

  postformat(str: string) {
    return str;
  }

  relativeTime(num: number, withoutSuffix: boolean, str: 'future' | 'past', isFuture: boolean): string {
    const output = this._relativeTime[str];

    return (isFunction(output)) ?
      output(num, withoutSuffix, str, isFuture) :
      output.replace(/%d/i, num.toString(10));
  }

  pastFuture(diff: number, output: string): string {
    const format = this._relativeTime[diff > 0 ? 'future' : 'past'];

    return isFunction(format) ? format(output) : format.replace(/%s/i, output);
  }

  /** Months */
  months(): string[];
  months(date: Date, format?: string, isUTC?: boolean): string;
  months(date?: Date, format?: string, isUTC = false): string | string[] {
    if (!date) {
      return isArray<string>(this._months)
        ? this._months
        : this._months.standalone;
    }

    if (isArray<string>(this._months)) {
      return this._months[getMonth(date, isUTC)];
    }

    const key = (this._months.isFormat || MONTHS_IN_FORMAT).test(format)
      ? 'format'
      : 'standalone';

    return this._months[key][getMonth(date, isUTC)];
  }

  monthsShort(): string[];
  monthsShort(date?: Date, format?: string, isUTC?: boolean): string;
  monthsShort(date?: Date, format?: string, isUTC = false): string | string[] {
    if (!date) {
      return isArray<string>(this._monthsShort)
        ? this._monthsShort
        : this._monthsShort.standalone;
    }

    if (isArray<string>(this._monthsShort)) {
      return this._monthsShort[getMonth(date, isUTC)];
    }
    const key = MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone';

    return this._monthsShort[key][getMonth(date, isUTC)];
  }

  monthsParse(monthName: string, format?: string, strict?: boolean): number {
    let date;
    let regex;

    if (this._monthsParseExact) {
      return this.handleMonthStrictParse(monthName, format, strict);
    }

    if (!this._monthsParse) {
      this._monthsParse = [];
      this._longMonthsParse = [];
      this._shortMonthsParse = [];
    }

    // TODO: add sorting
    // Sorting makes sure if one month (or abbr) is a prefix of another
    // see sorting in computeMonthsParse
    let i;
    for (i = 0; i < 12; i++) {
      // make the regex if we don't have it already
      date = new Date(Date.UTC(2000, i, 15));
      if (strict && !this._longMonthsParse[i]) {
        const _months = this.months(date, '', true).replace('.', '');
        const _shortMonths = this.monthsShort(date, '', true).replace('.', '');
        this._longMonthsParse[i] = new RegExp(`^${_months}$`, 'i');
        this._shortMonthsParse[i] = new RegExp(`^${_shortMonths}$`, 'i');
      }
      if (!strict && !this._monthsParse[i]) {
        regex = `^${this.months(date, '', true)}|^${this.monthsShort(date, '', true)}`;
        this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
      }
      // testing the regex
      if (strict && format === 'MMMM' && (this._longMonthsParse[i] as RegExp).test(monthName)) {
        return i;
      }

      if (strict && format === 'MMM' && (this._shortMonthsParse[i] as RegExp).test(monthName)) {
        return i;
      }

      if (!strict && this._monthsParse[i].test(monthName)) {
        return i;
      }
    }
  }

  monthsRegex(isStrict: boolean): RegExp {
    if (this._monthsParseExact) {
      if (!hasOwnProp(this, '_monthsRegex')) {
        this.computeMonthsParse();
      }
      if (isStrict) {
        return this._monthsStrictRegex;
      }

      return this._monthsRegex;
    }

    if (!hasOwnProp(this, '_monthsRegex')) {
      this._monthsRegex = defaultMonthsRegex;
    }

    return this._monthsStrictRegex && isStrict ?
      this._monthsStrictRegex : this._monthsRegex;
  }

  monthsShortRegex(isStrict: boolean): RegExp {
    if (this._monthsParseExact) {
      if (!hasOwnProp(this, '_monthsRegex')) {
        this.computeMonthsParse();
      }
      if (isStrict) {
        return this._monthsShortStrictRegex;
      }

      return this._monthsShortRegex;
    }
    if (!hasOwnProp(this, '_monthsShortRegex')) {
      this._monthsShortRegex = defaultMonthsShortRegex;
    }

    return this._monthsShortStrictRegex && isStrict ?
      this._monthsShortStrictRegex : this._monthsShortRegex;
  }

  /** Week */
  week(date: Date, isUTC?: boolean): number {
    return weekOfYear(date, this._week.dow, this._week.doy, isUTC).week;
  }

  firstDayOfWeek(): number {
    return this._week.dow;
  }

  firstDayOfYear(): number {
    return this._week.doy;
  }

  /** Day of Week */
  weekdays(): string[];
  weekdays(date: Date, format?: string, isUTC?: boolean): string;
  weekdays(date?: Date, format?: string, isUTC?: boolean): string | string[] {
    if (!date) {
      return isArray<string>(this._weekdays)
        ? this._weekdays
        : this._weekdays.standalone;
    }

    if (isArray<string>(this._weekdays)) {
      return this._weekdays[getDay(date, isUTC)];
    }

    const _key = this._weekdays.isFormat.test(format)
      ? 'format'
      : 'standalone';

    return this._weekdays[_key][getDay(date, isUTC)];
  }

  weekdaysMin(): string[];
  weekdaysMin(date: Date, format?: string, isUTC?: boolean): string;
  weekdaysMin(date?: Date, format?: string, isUTC?: boolean): string | string[] {
    return date ? this._weekdaysMin[getDay(date, isUTC)] : this._weekdaysMin;
  }

  weekdaysShort(): string[];
  weekdaysShort(date: Date, format?: string, isUTC?: boolean): string;
  weekdaysShort(date?: Date, format?: string, isUTC?: boolean): string | string[] {
    return date ? this._weekdaysShort[getDay(date, isUTC)] : this._weekdaysShort;
  }


  // proto.weekdaysParse  =        localeWeekdaysParse;
  weekdaysParse(weekdayName?: string, format?: string, strict?: boolean): number {
    let i;
    let regex;

    if (this._weekdaysParseExact) {
      return this.handleWeekStrictParse(weekdayName, format, strict);
    }

    if (!this._weekdaysParse) {
      this._weekdaysParse = [];
      this._minWeekdaysParse = [];
      this._shortWeekdaysParse = [];
      this._fullWeekdaysParse = [];
    }

    for (i = 0; i < 7; i++) {
      // make the regex if we don't have it already
      // fix: here is the issue
      const date = setDayOfWeek(new Date(Date.UTC(2000, 1)), i, null, true);
      if (strict && !this._fullWeekdaysParse[i]) {
        this._fullWeekdaysParse[i] = new RegExp(`^${this.weekdays(date, '', true).replace('.', '\.?')}$`, 'i');
        this._shortWeekdaysParse[i] = new RegExp(`^${this.weekdaysShort(date, '', true).replace('.', '\.?')}$`, 'i');
        this._minWeekdaysParse[i] = new RegExp(`^${this.weekdaysMin(date, '', true).replace('.', '\.?')}$`, 'i');
      }
      if (!this._weekdaysParse[i]) {
        regex = `^${this.weekdays(date, '', true)}|^${this.weekdaysShort(date, '', true)}|^${this.weekdaysMin(date, '', true)}`;
        this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
      }

      if (!isArray<RegExp>(this._fullWeekdaysParse)
        || !isArray<RegExp>(this._shortWeekdaysParse)
        || !isArray<RegExp>(this._minWeekdaysParse)
        || !isArray<RegExp>(this._weekdaysParse)) {
        return;
      }

      // testing the regex
      if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
        return i;
      } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
        return i;
      } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
        return i;
      } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
        return i;
      }
    }
  }

  // proto.weekdaysRegex       =        weekdaysRegex;
  weekdaysRegex(isStrict: boolean) {
    if (this._weekdaysParseExact) {
      if (!hasOwnProp(this, '_weekdaysRegex')) {
        this.computeWeekdaysParse();
      }

      if (isStrict) {
        return this._weekdaysStrictRegex;
      } else {
        return this._weekdaysRegex;
      }
    } else {
      if (!hasOwnProp(this, '_weekdaysRegex')) {
        this._weekdaysRegex = matchWord;
      }

      return this._weekdaysStrictRegex && isStrict ?
        this._weekdaysStrictRegex : this._weekdaysRegex;
    }
  }

  // proto.weekdaysShortRegex  =        weekdaysShortRegex;
  // proto.weekdaysMinRegex    =        weekdaysMinRegex;


  weekdaysShortRegex(isStrict?: boolean): RegExp {
    if (this._weekdaysParseExact) {
      if (!hasOwnProp(this, '_weekdaysRegex')) {
        this.computeWeekdaysParse();
      }
      if (isStrict) {
        return this._weekdaysShortStrictRegex;
      } else {
        return this._weekdaysShortRegex;
      }
    } else {
      if (!hasOwnProp(this, '_weekdaysShortRegex')) {
        this._weekdaysShortRegex = matchWord;
      }

      return this._weekdaysShortStrictRegex && isStrict ?
        this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
    }
  }

  weekdaysMinRegex(isStrict?: boolean): RegExp {
    if (this._weekdaysParseExact) {
      if (!hasOwnProp(this, '_weekdaysRegex')) {
        this.computeWeekdaysParse();
      }
      if (isStrict) {
        return this._weekdaysMinStrictRegex;
      } else {
        return this._weekdaysMinRegex;
      }
    } else {
      if (!hasOwnProp(this, '_weekdaysMinRegex')) {
        this._weekdaysMinRegex = matchWord;
      }

      return this._weekdaysMinStrictRegex && isStrict ?
        this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
    }
  }

  isPM(input: string): boolean {
    // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
    // Using charAt should be more compatible.
    return input.toLowerCase().charAt(0) === 'p';
  }

  meridiem(hours: number, minutes: number, isLower: boolean): string {
    if (hours > 11) {
      return isLower ? 'pm' : 'PM';
    }

    return isLower ? 'am' : 'AM';
  }

  formatLongDate(key: string) {
    this._longDateFormat = this._longDateFormat ? this._longDateFormat : defaultLongDateFormat;
    const format = this._longDateFormat[key];
    const formatUpper = this._longDateFormat[key.toUpperCase()];

    if (format || !formatUpper) {
      return format;
    }

    this._longDateFormat[
      key
      ] = formatUpper.replace(/MMMM|MM|DD|dddd/g, (val: string) => {
      return val.slice(1);
    });

    return this._longDateFormat[key];
  }

  private handleMonthStrictParse(monthName: string, format: string, strict?: boolean) {
    const llc = monthName.toLocaleLowerCase();
    let i;
    let ii;
    let mom;
    if (!this._monthsParse) {
      // this is not used
      this._monthsParse = [];
      this._longMonthsParse = [];
      this._shortMonthsParse = [];
      for (i = 0; i < 12; ++i) {
        mom = new Date(2000, i);
        this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
        this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
      }
    }

    if (strict) {
      if (format === 'MMM') {
        ii = (this._shortMonthsParse as string[]).indexOf(llc);

        return ii !== -1 ? ii : null;
      }
      ii = (this._longMonthsParse as string[]).indexOf(llc);

      return ii !== -1 ? ii : null;
    }

    if (format === 'MMM') {
      ii = (this._shortMonthsParse as string[]).indexOf(llc);
      if (ii !== -1) {
        return ii;
      }

      ii = (this._longMonthsParse as string[]).indexOf(llc);

      return ii !== -1 ? ii : null;
    }

    ii = (this._longMonthsParse as string[]).indexOf(llc);
    if (ii !== -1) {
      return ii;
    }
    ii = (this._shortMonthsParse as string[]).indexOf(llc);

    return ii !== -1 ? ii : null;
  }

  private handleWeekStrictParse(weekdayName: string, format: string, strict: boolean): number {
    let ii;
    const llc = weekdayName.toLocaleLowerCase();
    if (!this._weekdaysParse) {
      this._weekdaysParse = [];
      this._shortWeekdaysParse = [];
      this._minWeekdaysParse = [];

      let i;
      for (i = 0; i < 7; ++i) {
        const date = setDayOfWeek(new Date(Date.UTC(2000, 1)), i, null, true);
        this._minWeekdaysParse[i] = this.weekdaysMin(date).toLocaleLowerCase();
        this._shortWeekdaysParse[i] = this.weekdaysShort(date).toLocaleLowerCase();
        this._weekdaysParse[i] = this.weekdays(date, '').toLocaleLowerCase();
      }
    }

    if (!isArray<string>(this._weekdaysParse)
      || !isArray<string>(this._shortWeekdaysParse)
      || !isArray<string>(this._minWeekdaysParse)) {
      return;
    }

    if (strict) {
      if (format === 'dddd') {
        ii = this._weekdaysParse.indexOf(llc);

        return ii !== -1 ? ii : null;
      } else if (format === 'ddd') {
        ii = this._shortWeekdaysParse.indexOf(llc);

        return ii !== -1 ? ii : null;
      } else {
        ii = this._minWeekdaysParse.indexOf(llc);

        return ii !== -1 ? ii : null;
      }
    } else {
      if (format === 'dddd') {
        ii = this._weekdaysParse.indexOf(llc);
        if (ii !== -1) {
          return ii;
        }
        ii = this._shortWeekdaysParse.indexOf(llc);
        if (ii !== -1) {
          return ii;
        }
        ii = this._minWeekdaysParse.indexOf(llc);

        return ii !== -1 ? ii : null;
      } else if (format === 'ddd') {
        ii = this._shortWeekdaysParse.indexOf(llc);
        if (ii !== -1) {
          return ii;
        }
        ii = this._weekdaysParse.indexOf(llc);
        if (ii !== -1) {
          return ii;
        }
        ii = this._minWeekdaysParse.indexOf(llc);

        return ii !== -1 ? ii : null;
      } else {
        ii = this._minWeekdaysParse.indexOf(llc);
        if (ii !== -1) {
          return ii;
        }
        ii = this._weekdaysParse.indexOf(llc);
        if (ii !== -1) {
          return ii;
        }
        ii = this._shortWeekdaysParse.indexOf(llc);

        return ii !== -1 ? ii : null;
      }
    }
  }

  private computeMonthsParse() {
    const shortPieces: string[] = [];
    const longPieces: string[] = [];
    const mixedPieces: string[] = [];
    let date;

    let i;
    for (i = 0; i < 12; i++) {
      // make the regex if we don't have it already
      date = new Date(2000, i);
      shortPieces.push(this.monthsShort(date, ''));
      longPieces.push(this.months(date, ''));
      mixedPieces.push(this.months(date, ''));
      mixedPieces.push(this.monthsShort(date, ''));
    }
    // Sorting makes sure if one month (or abbr) is a prefix of another it
    // will match the longer piece.
    shortPieces.sort(cmpLenRev);
    longPieces.sort(cmpLenRev);
    mixedPieces.sort(cmpLenRev);
    for (i = 0; i < 12; i++) {
      shortPieces[i] = regexEscape(shortPieces[i]);
      longPieces[i] = regexEscape(longPieces[i]);
    }
    for (i = 0; i < 24; i++) {
      mixedPieces[i] = regexEscape(mixedPieces[i]);
    }

    this._monthsRegex = new RegExp(`^(${mixedPieces.join('|')})`, 'i');
    this._monthsShortRegex = this._monthsRegex;
    this._monthsStrictRegex = new RegExp(`^(${longPieces.join('|')})`, 'i');
    this._monthsShortStrictRegex = new RegExp(`^(${shortPieces.join('|')})`, 'i');
  }

  private computeWeekdaysParse() {
    const minPieces = [];
    const shortPieces = [];
    const longPieces = [];
    const mixedPieces = [];

    let i;
    for (i = 0; i < 7; i++) {
      // make the regex if we don't have it already
      // let mom = createUTC([2000, 1]).day(i);
      const date = setDayOfWeek(new Date(Date.UTC(2000, 1)), i, null, true);
      const minp = this.weekdaysMin(date);
      const shortp = this.weekdaysShort(date);
      const longp = this.weekdays(date);
      minPieces.push(minp);
      shortPieces.push(shortp);
      longPieces.push(longp);
      mixedPieces.push(minp);
      mixedPieces.push(shortp);
      mixedPieces.push(longp);
    }
    // Sorting makes sure if one weekday (or abbr) is a prefix of another it
    // will match the longer piece.
    minPieces.sort(cmpLenRev);
    shortPieces.sort(cmpLenRev);
    longPieces.sort(cmpLenRev);
    mixedPieces.sort(cmpLenRev);
    for (i = 0; i < 7; i++) {
      shortPieces[i] = regexEscape(shortPieces[i]);
      longPieces[i] = regexEscape(longPieces[i]);
      mixedPieces[i] = regexEscape(mixedPieces[i]);
    }

    this._weekdaysRegex = new RegExp(`^(${mixedPieces.join('|')})`, 'i');
    this._weekdaysShortRegex = this._weekdaysRegex;
    this._weekdaysMinRegex = this._weekdaysRegex;

    this._weekdaysStrictRegex = new RegExp(`^(${longPieces.join('|')})`, 'i');
    this._weekdaysShortStrictRegex = new RegExp(`^(${shortPieces.join('|')})`, 'i');
    this._weekdaysMinStrictRegex = new RegExp(`^(${minPieces.join('|')})`, 'i');
  }
}

function cmpLenRev(a: string, b: string): number {
  return b.length - a.length;
}
