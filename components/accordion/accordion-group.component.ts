import {
  Component, OnInit, OnDestroy, Input, HostBinding, Inject
} from 'angular2/core';
import {NgClass} from 'angular2/common';
import {Collapse} from '../collapse';
import {Accordion} from './accordion.component';

/* tslint:disable:component-selector-name */
@Component({
  selector: 'accordion-group, accordion-panel',
  directives: [Collapse, NgClass],
  template: `
    <div class="panel" [ngClass]="panelClass">
      <div class="panel-heading" (click)="toggleOpen($event)">
        <h4 class="panel-title">
          <a href tabindex="0" class="accordion-toggle">
            <span *ngIf="heading" [ngClass]="{'text-muted': isDisabled}">{{heading}}</span>
            <ng-content select="[accordion-heading]"></ng-content>
          </a>
        </h4>
      </div>
      <div class="panel-collapse collapse" [collapse]="!isOpen">
        <div class="panel-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class AccordionPanel implements OnInit, OnDestroy {
  @Input() public heading:string;
  @Input() public panelClass:string;
  @Input() public isDisabled:boolean;

  @HostBinding('class.panel-open')
  @Input()
  public get isOpen():boolean {
    return this._isOpen;
  }

  public set isOpen(value:boolean) {
    this._isOpen = value;
    if (value) {
      this.accordion.closeOtherPanels(this);
    }
  }

  private _isOpen:boolean;
  private accordion:Accordion;

  public constructor(@Inject(Accordion) accordion:Accordion) {
    this.accordion = accordion;
  }

  public ngOnInit():any {
    this.panelClass = this.panelClass || 'panel-default';
    this.accordion.addGroup(this);
  }

  public ngOnDestroy():any {
    this.accordion.removeGroup(this);
  }

  public toggleOpen(event:MouseEvent):any {
    event.preventDefault();
    if (!this.isDisabled) {
      this.isOpen = !this.isOpen;
    }
  }
}
