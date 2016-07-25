import {Component} from '@angular/core';
import {CollapseDirective} from '../../../ng2-bootstrap';

// webpack html imports
let template = require('./collapse-demo.html');

@Component({
  selector: 'collapse-demo',
  directives: [CollapseDirective],
  template: template
})
export class CollapseDemoComponent {
  public isCollapsed:boolean = false;

  public collapsed(event:any):void {
    console.log(event);
  }

  public expanded(event:any):void {
    console.log(event);
  }
}
