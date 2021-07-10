import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { ComponentLoader, ComponentLoaderFactory } from 'ngx-bootstrap/component-loader';

import { EMPTY, from, isObservable, Observable, Subscription } from 'rxjs';
import { debounceTime, filter, mergeMap, switchMap, tap, toArray } from 'rxjs/operators';
import { TypeaheadOptionItemContext, TypeaheadOptionListContext } from './models';

import { TypeaheadContainerComponent } from './typeahead-container.component';
import { TypeaheadMatch } from './typeahead-match.class';
import { TypeaheadOrder } from './typeahead-order.class';
import { getValueFromObject, latinize, tokenize } from './typeahead-utils';
import { TypeaheadConfig } from './typeahead.config';

// eslint-disable-next-line
type TypeaheadOption = string | Record<string | number, any>;
type TypeaheadOptionArr = TypeaheadOption[] | Observable<TypeaheadOption[]>;

@Directive({
  selector: '[typeahead]',
  exportAs: 'bs-typeahead',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    '[attr.aria-activedescendant]': 'activeDescendant',
    '[attr.aria-owns]': 'isOpen ? this._container.popupId : null',
    '[attr.aria-expanded]': 'isOpen',
    '[attr.aria-autocomplete]': 'list'
  }
})
export class TypeaheadDirective implements OnInit, OnDestroy {
  /** options source, can be Array of strings, objects or
   * an Observable for external matching process
   */
  @Input() typeahead?: TypeaheadOptionArr;
  /** minimal no of characters that needs to be entered before
   * typeahead kicks-in. When set to 0, typeahead shows on focus with full
   * list of options (limited as normal by typeaheadOptionsLimit)
   */
  @Input() typeaheadMinLength = 1;
  /** sets use adaptive position */
  @Input() adaptivePosition = false;
  /** turn on/off animation */
  @Input() isAnimated = false;
  /** minimal wait time after last character typed before typeahead kicks-in */
  @Input() typeaheadWaitMs = 0;
  /** maximum length of options items list. The default value is 20 */
  @Input() typeaheadOptionsLimit?: number;
  /** when options source is an array of objects, the name of field
   * that contains the options value, we use array item as option in case
   * of this field is missing. Supports nested properties and methods.
   */
  @Input() typeaheadOptionField?: string;
  /** when options source is an array of objects, the name of field that
   * contains the group value, matches are grouped by this field when set.
   */
  @Input() typeaheadGroupField?: string;
  /** Used to specify a custom order of matches. When options source is an array of objects
   * a field for sorting has to be set up. In case of options source is an array of string,
   * a field for sorting is absent. The ordering direction could be changed to ascending or descending.
   */
  @Input() typeaheadOrderBy?: TypeaheadOrder;
  /** should be used only in case of typeahead attribute is Observable of array.
   * If true - loading of options will be async, otherwise - sync.
   * true make sense if options array is large.
   */
  @Input() typeaheadAsync?: boolean;
  /** match latin symbols.
   * If true the word súper would match super and vice versa.
   */
  @Input() typeaheadLatinize = true;
  /** Can be use to search words by inserting a single white space between each characters
   *  for example 'C a l i f o r n i a' will match 'California'.
   */
  @Input() typeaheadSingleWords = true;
  /** should be used only in case typeaheadSingleWords attribute is true.
   * Sets the word delimiter to break words. Defaults to space.
   */
  @Input() typeaheadWordDelimiters = ' ';
  /** Can be used to conduct a search of multiple items and have suggestion not for the
   * whole value of the input but for the value that comes after a delimiter provided via
   * typeaheadMultipleSearchDelimiters attribute. This option can only be used together with
   * typeaheadSingleWords option if typeaheadWordDelimiters and typeaheadPhraseDelimiters
   * are different from typeaheadMultipleSearchDelimiters to avoid conflict in determining
   * when to delimit multiple searches and when a single word.
   */
  @Input() typeaheadMultipleSearch?: boolean;
  /** should be used only in case typeaheadMultipleSearch attribute is true.
   * Sets the multiple search delimiter to know when to start a new search. Defaults to comma.
   * If space needs to be used, then explicitly set typeaheadWordDelimiters to something else than space
   * because space is used by default OR set typeaheadSingleWords attribute to false if you don't need
   * to use it together with multiple search.
   */
  @Input() typeaheadMultipleSearchDelimiters = ',';
  /** should be used only in case typeaheadSingleWords attribute is true.
   * Sets the word delimiter to match exact phrase.
   * Defaults to simple and double quotes.
   */
  @Input() typeaheadPhraseDelimiters = '\'"';
  /** used to specify a custom item template.
   * Template variables exposed are called item and index;
   */
  @Input() typeaheadItemTemplate?: TemplateRef<TypeaheadOptionItemContext>;
  /** used to specify a custom options list template.
   * Template variables: matches, itemTemplate, query
   */
  @Input() optionsListTemplate?: TemplateRef<TypeaheadOptionListContext>;
  /** specifies if typeahead is scrollable  */
  @Input() typeaheadScrollable = false;
  /** specifies number of options to show in scroll view  */
  @Input() typeaheadOptionsInScrollableView = 5;
  /** used to hide result on blur */
  @Input() typeaheadHideResultsOnBlur?: boolean;
  /** fired when an options list was opened and the user clicked Tab
   * If a value equal true, it will be chosen first or active item in the list
   * If value equal false, it will be chosen an active item in the list or nothing
   */
  @Input() typeaheadSelectFirstItem = true;
  /** makes active first item in a list */
  @Input() typeaheadIsFirstItemActive = true;
  /** fired when 'busy' state of this component was changed,
   * fired on async mode only, returns boolean
   */
  @Output() typeaheadLoading = new EventEmitter<boolean>();
  /** fired on every key event and returns true
   * in case of matches are not detected
   */
  @Output() typeaheadNoResults = new EventEmitter<boolean>();
  /** fired when option was selected, return object with data of this option. */
  @Output() typeaheadOnSelect = new EventEmitter<TypeaheadMatch>();
  /** fired when option was previewed, return object with data of this option. */
  @Output() typeaheadOnPreview = new EventEmitter<TypeaheadMatch>();
  /** fired when blur event occurs. returns the active item */
  @Output() typeaheadOnBlur = new EventEmitter<TypeaheadMatch>();

  /**
   * A selector specifying the element the typeahead should be appended to.
   */
  @Input() container?: string;

  /** This attribute indicates that the dropdown should be opened upwards */
  @Input() dropup = false;

  // not yet implemented
  /** if false restrict model values to the ones selected from the popup only will be provided */
  // @Input() protected typeaheadEditable:boolean;
  /** if false the first match automatically will not be focused as you type */
  // @Input() protected typeaheadFocusFirst:boolean;
  /** format the ng-model result after selection */
  // @Input() protected typeaheadInputFormatter:any;
  /** if true automatically select an item when there is one option that exactly matches the user input */
  // @Input() protected typeaheadSelectOnExact:boolean;
  /**  if true select the currently highlighted match on blur */
  // @Input() protected typeaheadSelectOnBlur:boolean;
  /**  if false don't focus the input element the typeahead directive is associated with on selection */
    // @Input() protected typeaheadFocusOnSelect:boolean;

  activeDescendant?: string;
  isOpen = false;
  list = 'list';
  _container?: TypeaheadContainerComponent;
  isActiveItemChanged = false;
  isFocused = false;
  cancelRequestOnFocusLost = false;

  protected keyUpEventEmitter = new EventEmitter<string>();
  protected placement = 'bottom left';
  protected _matches: TypeaheadMatch[] = [];

  private _typeahead: ComponentLoader<TypeaheadContainerComponent>;
  private _subscriptions: Subscription[] = [];
  private _allEnteredValue?: string;
  private _outsideClickListener: () => void = () => void 0;

  constructor(
    cis: ComponentLoaderFactory,
    config: TypeaheadConfig,
    private changeDetection: ChangeDetectorRef,
    private element: ElementRef,
    private ngControl: NgControl,
    private renderer: Renderer2,
    viewContainerRef: ViewContainerRef
  ) {

    this._typeahead = cis.createLoader<TypeaheadContainerComponent>(
      element,
      viewContainerRef,
      renderer
    )
      .provide({ provide: TypeaheadConfig, useValue: config });

    Object.assign(this,
      {
        typeaheadHideResultsOnBlur: config.hideResultsOnBlur,
        cancelRequestOnFocusLost: config.cancelRequestOnFocusLost,
        typeaheadSelectFirstItem: config.selectFirstItem,
        typeaheadIsFirstItemActive: config.isFirstItemActive,
        typeaheadMinLength: config.minLength,
        adaptivePosition: config.adaptivePosition,
        isAnimated: config.isAnimated
      }
    );
  }

  get matches(): TypeaheadMatch[] {
    return this._matches;
  }

  ngOnInit(): void {
    this.typeaheadOptionsLimit = this.typeaheadOptionsLimit || 20;

    this.typeaheadMinLength =
      this.typeaheadMinLength === void 0 ? 1 : this.typeaheadMinLength;

    // async should be false in case of array
    if (this.typeaheadAsync === undefined && !(isObservable(this.typeahead))) {
      this.typeaheadAsync = false;
    }

    if (isObservable(this.typeahead)) {
      this.typeaheadAsync = true;
    }

    if (this.typeaheadAsync) {
      this.asyncActions();
    } else {
      this.syncActions();
    }

    this.checkDelimitersConflict();
  }

  @HostListener('input', ['$event'])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onInput(e: any): void {
    // For `<input>`s, use the `value` property. For others that don't have a
    // `value` (such as `<span contenteditable="true">`), use either
    // `textContent` or `innerText` (depending on which one is supported, i.e.
    // Firefox or IE).
    const value =
      e.target.value !== undefined
        ? e.target.value
        : e.target.textContent !== undefined
        ? e.target.textContent
        : e.target.innerText;

    if (value != null && value.trim().length >= this.typeaheadMinLength) {
      this.typeaheadLoading.emit(true);
      this.keyUpEventEmitter.emit(e.target.value);
    } else {
      this.typeaheadLoading.emit(false);
      this.typeaheadNoResults.emit(false);
      this.hide();
    }
  }

  @HostListener('keyup', ['$event'])
  onChange(event: KeyboardEvent): void {
    if (this._container) {
      // esc
      if (event.keyCode === 27 || event.key === 'Escape') {
        this.hide();

        return;
      }

      // up
      if (event.keyCode === 38 || event.key === 'ArrowUp') {
        this.isActiveItemChanged = true;
        this._container.prevActiveMatch();

        return;
      }

      // down
      if (event.keyCode === 40 || event.key === 'ArrowDown') {
        this.isActiveItemChanged = true;
        this._container.nextActiveMatch();

        return;
      }

      // enter
      if (event.keyCode === 13 || event.key === 'Enter') {
        this._container.selectActiveMatch();

        return;
      }
    }
  }

  @HostListener('click')
  @HostListener('focus')
  onFocus(): void {
    this.isFocused = true;
    // add setTimeout to fix issue #5251
    // to get and emit updated value if it's changed on focus
    setTimeout(() => {
      if (this.typeaheadMinLength === 0) {
        this.typeaheadLoading.emit(true);
        this.keyUpEventEmitter.emit(this.element.nativeElement.value || '');
      }
    }, 0);
  }

  @HostListener('blur')
  onBlur(): void {
    this.isFocused = false;
    if (this._container && !this._container.isFocused) {
      this.typeaheadOnBlur.emit(this._container.active);
    }

    if (!this.container && this._matches?.length === 0) {
      this.typeaheadOnBlur.emit(new TypeaheadMatch(
        this.element.nativeElement.value,
        this.element.nativeElement.value, 
        false));
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    // no container - no problems
    if (!this._container) {
      return;
    }

    if (event.keyCode === 9 || event.key === 'Tab') {
      this.onBlur();
    }

    if (event.keyCode === 9 || event.key === 'Tab' || event.keyCode === 13 || event.key === 'Enter') {
      event.preventDefault();
      if (this.typeaheadSelectFirstItem) {
        this._container.selectActiveMatch();

        return;
      }

      if (!this.typeaheadSelectFirstItem) {
        this._container.selectActiveMatch(this.isActiveItemChanged);
        this.isActiveItemChanged = false;
        this.hide();
      }
    }
  }

  changeModel(match?: TypeaheadMatch): void {
    if (!match) {
      return;
    }
    let valueStr: string;
    if (this.typeaheadMultipleSearch && this._allEnteredValue) {
      const tokens = this._allEnteredValue.split(new RegExp(`([${this.typeaheadMultipleSearchDelimiters}]+)`));
      this._allEnteredValue = tokens.slice(0, tokens.length - 1).concat(match.value).join('');
      valueStr = this._allEnteredValue;
    } else {
      valueStr = match.value;
    }
    this.ngControl.viewToModelUpdate(valueStr);
    this.ngControl.control?.setValue(valueStr);
    this.changeDetection.markForCheck();
    this.hide();
  }

  show(): void {
    this._typeahead
      .attach(TypeaheadContainerComponent)
      .to(this.container)
      .position({ attachment: `${this.dropup ? 'top' : 'bottom'} left` })
      .show({
        typeaheadRef: this,
        placement: this.placement,
        animation: false,
        dropup: this.dropup
      });

    this._outsideClickListener = this.renderer
      .listen('document', 'click', (event: MouseEvent) => {
        if (this.typeaheadMinLength === 0 && this.element.nativeElement.contains(event.target)) {
          return;
        }
        if (!this.typeaheadHideResultsOnBlur || this.element.nativeElement.contains(event.target)) {
          return;
        }
        this.onOutsideClick();
      });

    if (!this._typeahead.instance || !this.ngControl.control) {
      return;
    }

    this._container = this._typeahead.instance;
    this._container.parent = this;
    // This improves the speed as it won't have to be done for each list item

    const normalizedQuery = (this.typeaheadLatinize
      ? latinize(this.ngControl.control.value)
      : this.ngControl.control.value)
      .toString()
      .toLowerCase();

    this._container.query = this.tokenizeQuery(normalizedQuery);

    this._container.matches = this._matches;
    this.element.nativeElement.focus();

    this._container.activeChangeEvent.subscribe((activeId: string) => {
      this.activeDescendant = activeId;
      this.changeDetection.markForCheck();
    });
    this.isOpen = true;
  }

  hide(): void {
    if (this._typeahead.isShown) {
      this._typeahead.hide();
      this._outsideClickListener();
      this._container = void 0;
      this.isOpen = false;
      this.changeDetection.markForCheck();
    }
    this.typeaheadOnPreview.emit();
  }

  onOutsideClick(): void {
    if (this._container && !this._container.isFocused) {
      this.hide();
    }
  }

  ngOnDestroy() {
    // clean up subscriptions
    for (const sub of this._subscriptions) {
      sub.unsubscribe();
    }
    this._typeahead.dispose();
  }

  protected asyncActions(): void {
    this._subscriptions.push(
      this.keyUpEventEmitter
        .pipe(
          debounceTime<string>(this.typeaheadWaitMs),
          tap(value => this._allEnteredValue = value),
          switchMap(() => {
            if (!this.typeahead) {
              return EMPTY;
            }
            return this.typeahead;
          })
        )
        .subscribe((matches) => {
          this.finalizeAsyncCall(matches);
        })
    );
  }

  protected syncActions(): void {
    this._subscriptions.push(
      this.keyUpEventEmitter
        .pipe(
          debounceTime<string>(this.typeaheadWaitMs),
          mergeMap((value: string) => {
            this._allEnteredValue = value;
            const normalizedQuery = this.normalizeQuery(value);

            if (!this.typeahead) {
              return EMPTY;
            }

            const typeahead = isObservable(this.typeahead) ? this.typeahead : from(this.typeahead);

            return typeahead
              .pipe(
                filter((option: TypeaheadOption) => {
                  return !!option && this.testMatch(this.normalizeOption(option), normalizedQuery);
                }),
                toArray()
              );
          })
        )
        .subscribe((matches: TypeaheadOption[]) => {
          this.finalizeAsyncCall(matches);
        })
    );
  }

  protected normalizeOption(option: TypeaheadOption): string {
    const optionValue: string = getValueFromObject(
      option,
      this.typeaheadOptionField
    );
    const normalizedOption = this.typeaheadLatinize
      ? latinize(optionValue)
      : optionValue;

    return normalizedOption.toLowerCase();
  }

  protected tokenizeQuery(currentQuery: string | string[]): string | string[] {

    let query = currentQuery;
    if (this.typeaheadMultipleSearch && this.typeaheadSingleWords) {
      if (!this.haveCommonCharacters(`${this.typeaheadPhraseDelimiters}${this.typeaheadWordDelimiters}`,
        this.typeaheadMultipleSearchDelimiters)) {
        // single words and multiple search delimiters are different, can be used together
        query = tokenize(
          query as string,
          this.typeaheadWordDelimiters,
          this.typeaheadPhraseDelimiters,
          this.typeaheadMultipleSearchDelimiters
        );
      }
    } else if (this.typeaheadSingleWords) {
      query = tokenize(
        query as string,
        this.typeaheadWordDelimiters,
        this.typeaheadPhraseDelimiters
      );
    } else {
      // multiple searches
      query = tokenize(
        query as string,
        void 0,
        void 0,
        this.typeaheadMultipleSearchDelimiters
      );
    }

    return query;
  }

  protected normalizeQuery(value: string): string | string[] {
    // If singleWords, break model here to not be doing extra work on each iteration
    let normalizedQuery: string | string[] = (this.typeaheadLatinize
      ? latinize(value)
      : value)
      .toString()
      .toLowerCase();

    normalizedQuery = this.tokenizeQuery(normalizedQuery);

    return normalizedQuery;
  }

  protected testMatch(match: string, test: string[] | string): boolean {
    let spaceLength: number;

    if (typeof test === 'object') {
      spaceLength = test.length;
      for (let i = 0; i < spaceLength; i += 1) {
        if (test[i].length > 0 && match.indexOf(test[i]) < 0) {
          return false;
        }
      }

      return true;
    }

    return match.indexOf(test) >= 0;
  }

  protected finalizeAsyncCall(matches?: TypeaheadOption | TypeaheadOption[]): void {
    this.prepareMatches(matches || []);

    this.typeaheadLoading.emit(false);
    this.typeaheadNoResults.emit(!this.hasMatches());

    if (!this.hasMatches()) {
      this.hide();

      return;
    }

    if (!this.isFocused && this.cancelRequestOnFocusLost) {
      return;
    }

    if (this._container && this.ngControl.control) {
      // fix: remove usage of ngControl internals
      const _controlValue = (this.typeaheadLatinize
        ? latinize(this.ngControl.control.value)
        : this.ngControl.control.value) || '';

      // This improves the speed as it won't have to be done for each list item
      const normalizedQuery = _controlValue.toString().toLowerCase();

      this._container.query = this.tokenizeQuery(normalizedQuery);
      this._container.matches = this._matches;
    } else {
      this.show();
    }
  }

  protected prepareMatches(options: TypeaheadOption | TypeaheadOption[]): void {
    const limited = options.slice(0, this.typeaheadOptionsLimit);
    const sorted = !this.typeaheadOrderBy ? limited : this.orderMatches(limited);

    if (this.typeaheadGroupField) {
      let matches: TypeaheadMatch[] = [];

      // extract all group names
      const groups = sorted
        .map((option: TypeaheadOption) =>
          getValueFromObject(option, this.typeaheadGroupField)
        )
        .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);

      groups.forEach((group: string) => {
        // add group header to array of matches
        matches.push(new TypeaheadMatch(group, group, true));

        // add each item of group to array of matches
        matches = matches.concat(
          sorted
            .filter((option: TypeaheadOption) =>
              getValueFromObject(option, this.typeaheadGroupField) === group
            )
            .map((option: TypeaheadOption) =>
              new TypeaheadMatch(
                option,
                getValueFromObject(option, this.typeaheadOptionField)
              )
            )
        );
      });

      this._matches = matches;
    } else {
      this._matches = sorted.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (option: any) =>
          new TypeaheadMatch(
            option,
            getValueFromObject(option, this.typeaheadOptionField)
          )
      );
    }
  }

  protected orderMatches(options: TypeaheadOption[]): TypeaheadOption[] {
    if (!options.length) {
      return options;
    }

    if (this.typeaheadOrderBy !== null
      && this.typeaheadOrderBy !== undefined
      && typeof this.typeaheadOrderBy === 'object'
      && Object.keys(this.typeaheadOrderBy).length === 0) {
      console.error('Field and direction properties for typeaheadOrderBy have to be set according to documentation!');

      return options;
    }

    const { field, direction } = (this.typeaheadOrderBy || {});

    if (!direction || !(direction === 'asc' || direction === 'desc')) {
      console.error('typeaheadOrderBy direction has to equal "asc" or "desc". Please follow the documentation.');

      return options;
    }

    if (typeof options[0] === 'string') {
      return direction === 'asc' ? options.sort() : options.sort().reverse();
    }

    if (!field || typeof field !== 'string') {
      console.error('typeaheadOrderBy field has to set according to the documentation.');

      return options;
    }

    return options.sort((a: TypeaheadOption, b: TypeaheadOption) => {
      const stringA = getValueFromObject(a, field);
      const stringB = getValueFromObject(b, field);

      if (stringA < stringB) {
        return direction === 'asc' ? -1 : 1;
      }

      if (stringA > stringB) {
        return direction === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }

  protected hasMatches(): boolean {
    return this._matches.length > 0;
  }

  protected checkDelimitersConflict(): void {
    if (this.typeaheadMultipleSearch && this.typeaheadSingleWords
      && (this.haveCommonCharacters(`${this.typeaheadPhraseDelimiters}${this.typeaheadWordDelimiters}`,
        this.typeaheadMultipleSearchDelimiters))) {
      throw new Error(`Delimiters used in typeaheadMultipleSearchDelimiters must be different
          from delimiters used in typeaheadWordDelimiters (current value: ${this.typeaheadWordDelimiters}) and
          typeaheadPhraseDelimiters (current value: ${this.typeaheadPhraseDelimiters}).
          Please refer to the documentation`);
    }
  }

  protected haveCommonCharacters(str1: string, str2: string) {
    for (let i = 0; i < str1.length; i++) {
      if (str1.charAt(i).indexOf(str2) > -1) {
        return true;
      }
    }

    return false;
  }
}
