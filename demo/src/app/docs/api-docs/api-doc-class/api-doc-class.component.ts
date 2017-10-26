/**
 * @author ng-team
 * @copyright ng-bootstrap
 */
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ClassDesc, MethodDesc, signature, NgApiDoc } from '../api-docs.model';
import { Analytics } from '../analytics/analytics';
import { ComponentApi } from '../../models/components-api.model';

/**
 * Displays the API docs of a class, which is not a directive.
 *
 * For Config services, use NgbdApiDocsConfig instead.
 */
@Component({
  selector: 'ng-api-doc-class',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './api-doc-class.component.html'
})
export class NgApiDocClassComponent {
  headerAnchor: string;
  apiDocs: ClassDesc;

  private _analytics: Analytics;
  private docs: NgApiDoc;

  constructor(_analytics: Analytics, docs: NgApiDoc, content: ComponentApi) {
    this.docs = docs;
    this._analytics = _analytics;

    this.headerAnchor = content.anchor;
    this.apiDocs = this.docs[content.title];
  }

  methodSignature(method: MethodDesc): string {
    return signature(method);
  }

  trackSourceClick(): void {
    this._analytics.trackEvent('Source File View', this.apiDocs.className);
  }
}
