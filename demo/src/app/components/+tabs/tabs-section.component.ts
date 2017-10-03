import { Component } from '@angular/core';
import { DEMOS } from './demos';
// webpack html imports
let titleDoc = require('html-loader!markdown-loader!./docs/title.md');

@Component({
  selector: 'tabs-section',
  templateUrl: './tabs-section.component.html'
})
export class TabsSectionComponent {
  name: string = 'Tabs';
  src: string = 'https://github.com/valor-software/ngx-bootstrap/tree/development/src/tabs';
  demos: any = DEMOS;
  titleDoc: string = titleDoc;
}
