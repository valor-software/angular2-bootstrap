import { Component } from '@angular/core';

// webpack html imports
let doc = require('../../components/buttons/readme.md');
let titleDoc = require('../../components/buttons/title.md');

let ts = require('!!raw?lang=typescript!./buttons/buttons-demo.ts');
let html = require('!!raw?lang=markup!./buttons/buttons-demo.html');

@Component({
  selector: 'buttons-section',
  template: `
    <demo-section [name]="name" [src]="src" [titleDoc]="titleDoc" [html]="html" [ts]="ts" [doc]="doc">
      <buttons-demo></buttons-demo>
    </demo-section>`
})
export class ButtonsSectionComponent {
  public name:string = 'Buttons';
  public src:string = 'https://github.com/valor-software/ng2-bootstrap/blob/master/components/buttons';
  public html:string = html;
  public ts:string = ts;
  public titleDoc:string = titleDoc;
  public doc:string = doc;
}
