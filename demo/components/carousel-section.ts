import { Component } from '@angular/core';

// webpack html imports
let doc = require('../../components/carousel/readme.md');
let titleDoc = require('../../components/carousel/title.md');

let ts = require('!!raw?lang=typescript!./carousel/carousel-demo.ts');
let html = require('!!raw?lang=markup!./carousel/carousel-demo.html');

@Component({
  selector: 'carousel-section',
  template: `
    <demo-section [name]="name" [src]="src" [titleDoc]="titleDoc" [html]="html" [ts]="ts" [doc]="doc">
      <carousel-demo></carousel-demo>
    </demo-section>`
})
export class CarouselSectionComponent {
  public name:string = 'Carousel';
  public src:string = 'https://github.com/valor-software/ng2-bootstrap/blob/master/components/carousel';
  public html:string = html;
  public ts:string = ts;
  public titleDoc:string = titleDoc;
  public doc:string = doc;
}
