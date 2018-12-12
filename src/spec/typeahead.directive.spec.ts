import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { fireEvent } from '../../scripts/helpers';
import { TypeaheadMatch, TypeaheadDirective, TypeaheadModule } from '../typeahead';

interface State {
  id: number;
  name: string;
  region: string;
}

@Component({
  template: `
    <input [(ngModel)]="selectedState"
           [typeahead]="states"
           [typeaheadOptionField]="'name'"
           (typeaheadOnBlur)="onBlurEvent($event)">
  `
})
class TestTypeaheadComponent {
  selectedState: string;
  states: State[] = [
    {id: 1, name: 'Alabama', region: 'South'},
    {id: 2, name: 'Alaska', region: 'West'}
  ];

  onBlurEvent(activeItem) { return undefined; }
}

describe('Directive: Typeahead', () => {
  let fixture: ComponentFixture<TestTypeaheadComponent>;
  let component: TestTypeaheadComponent;
  let directive: TypeaheadDirective;
  let inputElement: HTMLInputElement;

  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [TestTypeaheadComponent],
      imports: [TypeaheadModule.forRoot(), FormsModule]
    }).createComponent(TestTypeaheadComponent);

    fixture.detectChanges();

    component = fixture.componentInstance;
    inputElement = fixture.debugElement.query(By.css('input'))
      .nativeElement as HTMLInputElement;

    // get the typeahead directive instance
    const inputs = fixture.debugElement.queryAll(
      By.directive(TypeaheadDirective)
    );
    directive = inputs.map(
      (de: DebugElement) =>
        de.injector.get<TypeaheadDirective>(TypeaheadDirective)
    )[0];
  });

  it('should be defined on the test component', () => {
    expect(directive).not.toBeNull();
  });

  describe('ngOnInit', () => {
    it('should set a default value for typeaheadOptionsLimit', () => {
      expect(directive.typeaheadOptionsLimit).toBe(20);
    });

    it('should set a default value for typeaheadMinLength', () => {
      expect(directive.typeaheadMinLength).toBe(1);
    });

    it('should set a default value for typeaheadWaitMs', () => {
      expect(directive.typeaheadWaitMs).toBe(0);
    });

    it('should set a default value for typeaheadAsync', () => {
      expect(directive.typeaheadAsync).toBeFalsy();
    });
    it('should set a default value for typeaheadIsHideOnBlur', () => {
      expect(directive.typeaheadIsHideOnBlur).toBeTruthy();
    });

    it('should typeaheadAsync to false, if typeahead is an observable', () => {
      directive.typeahead = of(component.states);
      directive.ngOnInit();

      expect(directive.typeaheadAsync).toBeTruthy();
    });

    it('should not render the typeahead-container', () => {
      const typeaheadContainer = fixture.debugElement.query(
        By.css('typeahead-container')
      );

      expect(typeaheadContainer).toBeNull();
    });

    it('should not set the container reference', () => {
      expect(directive._container).toBeFalsy();
    });
  });

  describe('onChange', () => {
    beforeEach(
      fakeAsync(() => {
        inputElement.value = 'Ala';
        fireEvent(inputElement, 'input');

        fixture.detectChanges();
        tick(100);
      })
    );

    it('should render the typeahead-container child element', () => {
      const typeaheadContainer = fixture.debugElement.nativeElement.querySelector(
        'typeahead-container'
      );
      expect(typeaheadContainer).not.toBeNull();
    });

    it('should set the container reference', () => {
      expect(directive._container).toBeTruthy();
    });

    it(
      'should result in a total of 2 matches, when "Ala" is entered',
      fakeAsync(() => {
        expect(directive.matches.length).toBe(2);
      })
    );

    it(
      'should result in 2 item matches, when "Ala" is entered',
      fakeAsync(() => {
        expect(directive.matches).toContain(
          new TypeaheadMatch(
            {id: 1, name: 'Alabama', region: 'South'},
            'Alabama'
          )
        );
        expect(directive.matches).toContain(
          new TypeaheadMatch(
            {id: 2, name: 'Alaska', region: 'West'},
            'Alaska'
          )
        );
      })
    );

    it(
      'should result in 0 matches, when input does not match',
      fakeAsync(() => {
        inputElement.value = 'foo';
        fireEvent(inputElement, 'input');

        fixture.detectChanges();
        tick(100);

        expect(directive.matches.length).toBe(0);
      })
    );

    it(
      'should not display null item',
      fakeAsync(() => {
        component.states.push({id: 3, name: null, region: 'West'});
        inputElement.value = 'Ala';
        fireEvent(inputElement, 'input');
        fixture.detectChanges();
        tick(100);

        expect(directive.matches.length).toBe(2);
      })
    );
  });

  describe('onChange grouped', () => {
    beforeEach(
      fakeAsync(() => {
        inputElement.value = 'Ala';
        fireEvent(inputElement, 'input');
        directive.typeaheadGroupField = 'region';

        fixture.detectChanges();
        tick(100);
      })
    );

    it(
      'should result in a total of 4 matches, when "Ala" is entered',
      fakeAsync(() => {
        expect(directive.matches.length).toBe(4);
      })
    );

    it(
      'should result in 2 header matches, when "Ala" is entered',
      fakeAsync(() => {
        expect(directive.matches).toContain(
          new TypeaheadMatch('South', 'South', true)
        );
        expect(directive.matches).toContain(
          new TypeaheadMatch('West', 'West', true)
        );
      })
    );

    it(
      'should result in 2 item matches, when "Ala" is entered',
      fakeAsync(() => {
        expect(directive.matches).toContain(
          new TypeaheadMatch(
            {id: 1, name: 'Alabama', region: 'South'},
            'Alabama'
          )
        );
        expect(directive.matches).toContain(
          new TypeaheadMatch(
            {id: 2, name: 'Alaska', region: 'West'},
            'Alaska'
          )
        );
      })
    );
  });

  describe('changeModel', () => {
    it('should set the selectedState value', () => {
      directive.changeModel(
        new TypeaheadMatch(
          {id: 1, name: 'Alabama', region: 'South'},
          'Alabama'
        )
      );

      expect(component.selectedState).toBe('Alabama');
    });
  });

  describe('onBlur', () => {
    beforeEach(
      fakeAsync(() => {
        inputElement.value = 'Alab';
        fireEvent(inputElement, 'input');

        fixture.detectChanges();
        tick(100);
      })
    );

    it('blur event should send the correct active item', () => {
      spyOn(fixture.componentInstance, 'onBlurEvent').and.callFake(param => {
        expect(param.item.id).toBe(1);
      });
      directive.onBlur();
      fixture.detectChanges();
    });
  });

  describe('if typeaheadIsHideOnBlur', () => {
    beforeEach(
      fakeAsync(() => {
        inputElement.value = 'Ala';
        fireEvent(inputElement, 'input');
        directive.typeaheadIsHideOnBlur = false;
        fixture.detectChanges();
        tick(100);
      })
    );

    it('equal true should be opened',
      fakeAsync(() => {
        document.dispatchEvent(new Event('click'));
        tick();

        expect(fixture.nativeElement.querySelector('.dropdown').classList).toContain('open');
      })
    );

    it('equal false should be closed',
      fakeAsync(() => {
        directive.typeaheadIsHideOnBlur = true;
        document.dispatchEvent(new Event('click'));
        tick();

        expect(fixture.debugElement.query(By.css('typeahead-container'))).toBeNull();
      })
    );
  });
});
