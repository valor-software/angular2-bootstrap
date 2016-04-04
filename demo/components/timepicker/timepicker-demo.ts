import {Component} from 'angular2/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';
import {Timepicker} from '../../../ng2-bootstrap';

// webpack html imports
let template = require('./timepicker-demo.html');

@Component({
  selector: 'timepicker-demo',
  directives: [Timepicker, CORE_DIRECTIVES, FORM_DIRECTIVES],
  template: template
})
export class TimepickerDemo {
  public hstep:number = 1;
  public mstep:number = 15;
  public ismeridian:boolean = true;

  public mytime:Date = new Date();
  public options:any = {
    hstep: [1, 2, 3],
    mstep: [1, 5, 10, 15, 25, 30]
  };

  public toggleMode():void {
    this.ismeridian = !this.ismeridian;
  };

  public update():void {
    let d = new Date();
    d.setHours(14);
    d.setMinutes(0);
    this.mytime = d;
  };

  public changed():void {
    console.log('Time changed to: ' + this.mytime);
  };

  public clear():void {
    this.mytime = void 0;
  };
}
