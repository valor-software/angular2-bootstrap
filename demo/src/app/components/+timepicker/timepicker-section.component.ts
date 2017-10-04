import { Component } from '@angular/core';
import { DEMOS } from './demos';
// webpack html imports
let titleDoc = require('html-loader!markdown-loader!./docs/title.md');

@Component({
  selector: 'timepicker-section',
  templateUrl: './timepicker-section.component.html'
})
export class TimepickerSectionComponent {
  name: string = 'Timepicker';
  src: string = 'https://github.com/valor-software/ngx-bootstrap/tree/development/src/timepicker';
  demos: any = DEMOS;
  titleDoc: string = titleDoc;
}
