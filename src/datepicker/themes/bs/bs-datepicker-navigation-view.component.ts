import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BsDatepickerViewMode, BsNavigationDirection, NavigationViewModel } from '../../models';

@Component({
  selector: 'bs-datepicker-navigation-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button class="previous"
            [disabled]="calendar.disableLeftArrow"
            [style.visibility]="calendar.hideLeftArrow ? 'hidden' : 'visible'"
            type="button"
            (click)="navTo($event, true)">
      <span>&lsaquo;</span>
    </button>

    <ng-container *ngIf="calendar && calendar.monthTitle">
      &#8203;  <!-- zero-width space needed for correct alignment
                  with preserveWhitespaces: false in Angular -->

      <button class="current"
            type="button"
            (click)="view('month')"
      ><span>{{ calendar.monthTitle }}</span>
      </button>
    </ng-container>

    &#8203;  <!-- zero-width space needed for correct alignment
                  with preserveWhitespaces: false in Angular -->

    <button class="current" (click)="view('year')" type="button">
      <span>{{ calendar.yearTitle }}</span>
    </button>

    &#8203;  <!-- zero-width space needed for correct alignment
                  with preserveWhitespaces: false in Angular -->

    <button class="next"
            [disabled]="calendar.disableRightArrow"
            [style.visibility]="calendar.hideRightArrow ? 'hidden' : 'visible'"
            type="button"
            (click)="navTo($event, false)"><span>&rsaquo;</span>
    </button>
  `
})
export class BsDatepickerNavigationViewComponent {
  @Input() calendar!: NavigationViewModel;

  @Output() onNavigate = new EventEmitter<BsNavigationDirection>();
  @Output() onViewMode = new EventEmitter<BsDatepickerViewMode>();

  navTo(event: any, down: boolean): void {
    this.onNavigate.emit(
      down ? BsNavigationDirection.DOWN : BsNavigationDirection.UP
    );
    event.stopPropagation();
  }

  view(viewMode: BsDatepickerViewMode): void {
    this.onViewMode.emit(viewMode);
  }
}
