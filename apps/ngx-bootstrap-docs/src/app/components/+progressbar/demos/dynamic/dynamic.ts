import { Component } from '@angular/core';

@Component({
  selector: 'demo-progressbar-dynamic',
  templateUrl: './dynamic.html'
})
export class DemoProgressbarDynamicComponent {
  max = 200;
  showWarning: boolean;
  dynamic: number;
  type: string;

  constructor() {
    this.random();
  }

  random(): void {
    const value = Math.floor(Math.random() * 100 + 1);
    let type: string;

    if (value < 25) {
      type = 'success';
    } else if (value < 50) {
      type = 'info';
    } else if (value < 75) {
      type = 'warning';
    } else {
      type = 'danger';
    }

    this.dynamic = value;
    this.type = type;
  }
}
