
// tslint:disable:comment-format binary-expression-operand-order max-line-length
// tslint:disable:no-bitwise prefer-template cyclomatic-complexity
// tslint:disable:no-shadowed-variable switch-default prefer-const
// tslint:disable:one-variable-per-declaration newline-before-return

import { LocaleData } from './../locale/locale.class';

//! moment.js locale configuration
//! locale : Greek [gr]
//! author : Dimitris Mitsiou : https://github.com/dimitrismitsiou

export const elLocale: LocaleData = {
  abbr: 'el',
  months : 'Ιανουάριος_Φεβρουάριος_Μάρτιος_Απρίλιος_Μάϊος_Ιούνιος_Ιούλιος_Άυγουστος_Σεπτέμβριος_Οκτώβριος_Νοέμβριος_Δεκέμβριος'.split('_'),
  monthsShort : 'Ιαν_Φεβ_Μάρ_Απρ_Μάϊ_Ιούν_Ιούλ_Άυγ_Σεπ_Οκτ_Νοε_Δεκ'.split('_'),
  weekdays : 'Κυριακή_Δευτέρα_Τρίτη_Τετάρτη_Πέμπτη_Παρασκευή_Σάββατο'.split('_'),
  weekdaysShort : 'Κυρ_Δευ_Τρί_Τετ_Πέμ_Παρ_Σάβ'.split('_'),
  weekdaysMin : 'Κυ_Δε_Τρ_Τε_Πε_Πα_Σα'.split('_'),
  longDateFormat : {
    LT : 'HH:mm',
    LTS : 'HH:mm:ss',
    L : 'DD/MM/YYYY',
    LL : 'D MMMM YYYY',
    LLL : 'D MMMM YYYY HH:mm',
    LLLL : 'dddd, D MMMM YYYY HH:mm'
  },
  calendar : {
    sameDay : '[Σήμερα στις] LT',
    nextDay : '[Αύριο στις] LT',
    nextWeek : 'dddd [στις] LT',
    lastDay : '[Χτές στις] LT',
    lastWeek : '[Τελευταία] dddd [στις] LT',
    sameElse : 'L'
  },
  relativeTime : {
    future : 'σε %s',
    past : '%s πριν',
    s : 'μερικά δευτερόλεπτα πρίν',
    ss : '%d δευτερόλεπτα',
    m : 'ένα λεπτό',
    mm : '%d λεπτά',
    h : 'μία ώρα',
    hh : '%d ώρες',
    d : 'μία μέρα',
    dd : '%d μέρες',
    M : 'ένας μήνας',
    MM : '%d μήνες',
    y : 'ένας χρόνος',
    yy : '%d χρόνια'
  },
  dayOfMonthOrdinalParse: /\d{1,2}(st|nd|rd|th)/,
  ordinal(_num: number): string {
    const num = Number(_num);
    const b = num % 10,
      output = (~~(num % 100 / 10) === 1) ? 'th' :
        (b === 1) ? 'st' :
          (b === 2) ? 'nd' :
            (b === 3) ? 'rd' : 'th';
    return num + output;
  },
  week : {
    dow : 1, // Monday is the first day of the week.
    doy : 4  // The week that contains Jan 4th is the first week of the year.
  }
};
