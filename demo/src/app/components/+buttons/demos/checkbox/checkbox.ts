import { Component } from '@angular/core';

@Component({
  selector: 'demo-buttons-checkbox',
  templateUrl: './checkbox.html'
})
export class DemoButtonsCheckboxComponent {
  checkModel: any = { left: false, middle: true, right: false };
}
