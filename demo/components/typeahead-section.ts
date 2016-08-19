import { Component } from '@angular/core';

// webpack html imports
let doc = require('../../components/typeahead/readme.md');
let titleDoc = require('../../components/typeahead/title.md');

let ts = require('!!raw?lang=typescript!./typeahead/typeahead-demo.ts');
let html = require('!!raw?lang=markup!./typeahead/typeahead-demo.html');

@Component({
  selector: 'typeahead-section',
  template: `
    <demo-section [name]="name" [src]="src" [titleDoc]="titleDoc" [html]="html" [ts]="ts" [doc]="doc">
      <typeahead-demo></typeahead-demo>
    </demo-section>`
})
export class TypeaheadSectionComponent {
  public name:string = 'Typeahead';
  public src:string = 'https://github.com/valor-software/ng2-bootstrap/blob/master/components/typeahead';
  public html:string = html;
  public ts:string = ts;
  public titleDoc:string = titleDoc;
  public doc:string = doc;
}
