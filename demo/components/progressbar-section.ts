import { Component } from '@angular/core';

import { Ng2BootstrapConfig, Ng2BootstrapTheme } from '../../ng2-bootstrap';

// webpack html imports
let doc = require('../../components/progressbar/readme.md');
let titleDoc = require('../../components/progressbar/title.md');

let ts = require('!!raw?lang=typescript!./progressbar/progressbar-demo.ts');

let templates:any = {
  [Ng2BootstrapTheme.BS3]: require('!!raw?lang=markup!./progressbar/progressbar-demo.html'),
  [Ng2BootstrapTheme.BS4]: require('!!raw?lang=markup!./progressbar/progressbar-demo-bs4.html')
};

let html = templates[Ng2BootstrapConfig.theme];

@Component({
  selector: 'progressbar-section',
  template: `
    <demo-section [name]="name" [src]="src" [titleDoc]="titleDoc" [html]="html" [ts]="ts" [doc]="doc">
      <progressbar-demo></progressbar-demo>
    </demo-section>`
})
export class ProgressbarSectionComponent {
  public name:string = 'Progressbar';
  public src:string = 'https://github.com/valor-software/ng2-bootstrap/blob/master/components/progressbar';
  public html:string = html;
  public ts:string = ts;
  public titleDoc:string = titleDoc;
  public doc:string = doc;
}
