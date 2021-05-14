import { Component } from '@angular/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'demo-pagination-page-changed-event',
  templateUrl: './page-changed-event.html'
})
export class DemoPaginationPageChangedComponent {
  currentPage = 4;
  page: number;

  pageChanged(event: any): void {
    this.page = event.page;
  }
}
