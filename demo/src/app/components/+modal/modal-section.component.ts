import { Component } from '@angular/core';
import { DEMOS } from './demos';

// webpack html imports
let titleDoc = require('html-loader!markdown-loader!./docs/title.md');

@Component({
  selector: 'modal-section',
  templateUrl: './modal-section.component.html'
})
export class ModalSectionComponent {
  name: string = 'Modals';
  src: string = 'https://github.com/valor-software/ngx-bootstrap/tree/development/src/modal';
  demos: any = DEMOS;
  titleDoc: string = titleDoc;
}
