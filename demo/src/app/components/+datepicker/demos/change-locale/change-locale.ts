import { Component } from '@angular/core';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { listLocales } from 'ngx-bootstrap/chronos';

@Component({
  selector: 'demo-datepicker-change-locale',
  templateUrl: './change-locale.html'
})
export class DemoDatepickerChangeLocaleComponent {
  locale = 'en';
  locales = listLocales();

  constructor(private localeService: BsLocaleService) {}

  applyLocale(pop: any) {
    this._localeService.use(this.locale);
    pop.hide();
    pop.show();
  }
}
