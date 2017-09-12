import {
  Component,
  Host,
  HostBinding,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';

import { ProgressDirective } from './progress.directive';
import { isBs3 } from '../utils/theme-provider';

// todo: number pipe
// todo: use query from progress?
@Component({
  selector: 'bar',
  template: `
  <div class="progress-bar"
    style="min-width: 0;"
    role="progressbar"
    [ngClass]="type && 'progress-bar-' + type + ' bg-' + type"
    [ngStyle]="{width: (isBs3 ? (percent < 100 ? percent : 100) + '%' : '100%'), transition: transition}"
    aria-valuemin="0"
    [attr.aria-valuenow]="value"
    [attr.aria-valuetext]="percent.toFixed(0) + '%'"
    [attr.aria-valuemax]="max"><ng-content></ng-content></div>
`
})
export class BarComponent implements OnInit, OnDestroy {
  max: number;

  /** provide one of the four supported contextual classes: `success`, `info`, `warning`, `danger` */
  @Input() type: string;
  /** current value of progress bar */
  @Input()
  get value(): number {
    return this._value;
  }
  @HostBinding('style.width.%')
  get setBarWidth() {
    this.recalculatePercentage();
    return this.isBs3 ? '' : this.percent;
  }

  set value(v: number) {
    if (!v && v !== 0) {
      return;
    }
    this._value = v;
    this.recalculatePercentage();
  }

  get isBs3(): boolean {
    return isBs3();
  }
  percent = 0;
  transition: string;
  progress: ProgressDirective;

  protected _value: number;

  constructor(@Host() progress: ProgressDirective) {
    this.progress = progress;
  }

  ngOnInit(): void {
    this.progress.addBar(this);
  }

  ngOnDestroy(): void {
    this.progress.removeBar(this);
  }

  recalculatePercentage(): void {
    this.percent = +(100 * this.value / this.progress.max).toFixed(2);

    const totalPercentage = this.progress.bars.reduce(function(
      total: number,
      bar: BarComponent
    ): number {
      return total + bar.percent;
    }, 0);

    if (totalPercentage > 100) {
      this.percent -= totalPercentage - 100;
    }
  }
}
