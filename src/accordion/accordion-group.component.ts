import {
  Component, HostBinding, Inject, Input, OnDestroy, OnInit, Output, EventEmitter
} from '@angular/core';
import { isBs3 } from 'ngx-bootstrap/utils';
import { AccordionComponent } from './accordion.component';
import { trigger, state, transition, style, animate } from '@angular/animations';
import {
  expandedStyleDefinition,
  collapsedStyleDefinition,
  COLLAPSE_ANIMATION_TIMING
} from './accordion-animations';

const openAnimationKey = 'open';
const closedAnimationKey = 'closed';

/**
 * ### Accordion heading
 * Instead of using `heading` attribute on the `accordion-group`, you can use
 * an `accordion-heading` attribute on `any` element inside of a group that
 * will be used as group's header template.
 */
@Component({
  selector: 'accordion-group, accordion-panel',
  templateUrl: './accordion-group.component.html',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'panel',
    style: 'display: block'
  },
  styleUrls: ['./accordion.scss'],
  animations: [
    trigger('openClose', [
      state(openAnimationKey, style({ ...expandedStyleDefinition })),
      state(closedAnimationKey, style({ ...collapsedStyleDefinition })),
      transition('open => closed', [
        animate(COLLAPSE_ANIMATION_TIMING)
      ]),
      transition('closed => open', [
        animate(COLLAPSE_ANIMATION_TIMING)
      ])
    ])
  ]
})
export class AccordionPanelComponent implements OnInit, OnDestroy {
  /** turn on/off animation */
  isAnimated = false;
  /** Clickable text in accordion's group header, check `accordion heading` below for using html in header */
  @Input() heading!: string;
  /** Provides an ability to use Bootstrap's contextual panel classes
   * (`panel-primary`, `panel-success`, `panel-info`, etc...).
   * List of all available classes [available here]
   * (https://getbootstrap.com/docs/3.3/components/#panels-alternatives)
   */
  @Input() panelClass = 'panel-default';
  /** if <code>true</code> — disables accordion group */
  @Input() isDisabled = false;
  /** Emits when the opened state changes */
  @Output() isOpenChange: EventEmitter<boolean> = new EventEmitter();

  // Questionable, maybe .panel-open should be on child div.panel element?
  /** Is accordion group open or closed. This property supports two-way binding */
  @HostBinding('class.panel-open')
  @Input()
  get isOpen(): boolean {
    return this._isOpen;
  }

  set isOpen(value: boolean) {
    if (value !== this.isOpen) {
      if (value) {
        this.accordion.closeOtherPanels(this);
      }
      this._isOpen = value;
      (async () => {
        await Promise.resolve();
        this.isOpenChange.emit(value);
      });
    }
  }

  get isBs3(): boolean {
    return isBs3();
  }

  protected _isOpen = false;
  protected accordion: AccordionComponent;

  constructor(@Inject(AccordionComponent) accordion: AccordionComponent) {
    this.accordion = accordion;
  }

  ngOnInit(): void {
    this.accordion.addGroup(this);
  }

  ngOnDestroy(): void {
    this.accordion.removeGroup(this);
  }

  toggleOpen(): void {
    if (!this.isDisabled) {
      this.isOpen = !this.isOpen;
    }
  }

  getAnimationKey(): string {
    return this.isOpen ? openAnimationKey : closedAnimationKey;
  }
}
