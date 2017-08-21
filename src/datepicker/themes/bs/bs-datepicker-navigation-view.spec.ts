import { Component } from '@angular/core';
import { BsNavigationEvent, MonthViewModel } from '../../models/index';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BsDatepickerNavigationViewComponent } from './bs-datepicker-navigation-view.component';

type TestFixture = ComponentFixture<TestComponent>;
const titleSelector = '.current';
const prevNavSelector = '.previous';
const nextNavSelector = '.next';

function getTitles(fixture: TestFixture): string[] {
  const elements = fixture.nativeElement
    .querySelectorAll(titleSelector);

  return [elements[0].innerText, elements[1].innerText];
}

function getPrevNavButton(fixture: TestFixture): HTMLElement {
  return fixture.nativeElement
    .querySelector(prevNavSelector) as HTMLElement;
}

function getNextNavButton(fixture: TestFixture): HTMLElement {
  return fixture.nativeElement
    .querySelector(nextNavSelector) as HTMLElement;
}

function getNavEvent(fixture: TestFixture): BsNavigationEvent {
  return fixture.componentInstance._navTo;
}

function setMonth(fixture: TestFixture, month: Partial<MonthViewModel>): void {
  fixture.componentInstance.month = month as MonthViewModel;
  fixture.detectChanges();
}

describe('datepicker: bs-datepicker-navigation-view', () => {
  let fixture: TestFixture;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, BsDatepickerNavigationViewComponent]
    })
      .compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
  });

  it('should display month and year titles', () => {
    const monthTitle = 'Some month';
    const yearTitle = 'Some year';

    setMonth(fixture, {monthTitle, yearTitle});
    const titles = getTitles(fixture);

    expect(titles[0]).toBe(monthTitle);
    expect(titles[1]).toBe(yearTitle);
  });

  it('should display navigation buttons by default', () => {
    const prev = getPrevNavButton(fixture);
    const next = getNextNavButton(fixture);
    setMonth(fixture, {});
    expect(prev.style.visibility).toBe('visible');
    expect(next.style.visibility).toBe('visible');
  });

  it('should hide prev nav button', () => {
    const prev = getPrevNavButton(fixture);
    setMonth(fixture, {hideLeftArrow: true});
    expect(prev.style.visibility).toBe('hidden');
  });

  it('should hide next nav button', () => {
    const next = getNextNavButton(fixture);
    setMonth(fixture, {hideRightArrow: true});
    expect(next.style.visibility).toBe('hidden');
  });

  it('on prev nav button click should decrease month on 1', () => {
    const prev = getPrevNavButton(fixture);
    prev.click();
    expect(getNavEvent(fixture).step.month).toBe(-1);
  });

  it('on next nav button click should increase month on 1', () => {
    const next = getNextNavButton(fixture);
    next.click();
    expect(getNavEvent(fixture).step.month).toBe(1);
  });
});

@Component({
  selector: 'test-cmp',
  template: `
    <bs-datepicker-navigation-view
      [month]="month"
      (onNavigate)="navTo($event)"
    ></bs-datepicker-navigation-view>`
})
class TestComponent {
  month: MonthViewModel;
  _navTo: BsNavigationEvent;

  navTo(event: BsNavigationEvent): void {
    this._navTo = event;
  }
}
