import { DemoDatepickerBasicComponent } from './demos/basic/basic';
import { DemoDatepickerDateInitialStateComponent } from './demos/date-initial-state/date-initial-state';
import { DemoDatepickerColorThemingComponent } from './demos/color-theming/color-theming';
import { DemoDatepickerChangeLocaleComponent } from './demos/change-locale/change-locale';
import { DemoDatepickerMinMaxComponent } from './demos/min-max/min-max';
import { DemoDatepickerDisabledComponent } from './demos/disabled/disabled';
import { DemoDatepickerFormsComponent } from './demos/forms/forms';
import { DemoDatepickerReactiveFormsComponent } from './demos/reactive-forms/reactive-forms';
import { DemoDatepickerConfigMethodComponent } from './demos/config-method/config-method';
import { DemoDatepickerVisibilityMethodsComponent } from './demos/visibility-methods/visibility-methods';
import { DemoDatePickerConfigObjectComponent } from './demos/config-object/config-object';
import { DemoDatepickerOutsideClickComponent } from './demos/outside-click/outside-click';
import { DemoDatepickerIsOpenComponent } from './demos/is-open/is-open';
import { DatepickerDemoComponent } from './demos/old/old';
import { DemoDatePickerCustomFormatComponent } from './demos/custom-format/custom-format';
import { DemoDatepickerPlacementComponent } from './demos/placement/placement';
import { DemoDatePickerVisibilityEventsComponent } from './demos/visibility-events/visibility-events';
import { DemoDatepickerValueChangeEventComponent } from './demos/value-change-event/value-change-event';
import { DemoDatepickerTriggersComponent } from './demos/triggers/triggers';
import { DemoDatepickerHideOnScrollComponent } from './demos/hide-on-scroll/hide-on-scroll';

import { ContentSection } from '../../docs/models/content-section.model';
import { DemoTopSectionComponent } from '../../docs/demo-section-components/demo-top-section/index';
import { ExamplesComponent } from '../../docs/demo-section-components/demo-examples-section/index';
import { ApiSectionsComponent } from '../../docs/demo-section-components/demo-api-section/index';

import {
  NgApiDocComponent,
  NgApiDocConfigComponent
} from '../../docs/api-docs';


export const demoComponentContent: ContentSection[] = [
  {
    name: 'Usage',
    anchor: 'usage',
    outlet: DemoTopSectionComponent,
    content: {
      doc: require('!!raw-loader?lang=typescript!./docs/usage.md')
    }
  },
  {
    name: 'Examples',
    anchor: 'examples',
    outlet: ExamplesComponent,
    componentName: 'datepicker',
    content: [
      {
        title: 'Basic',
        anchor: 'basic',
        demoName: 'basic',
        component: require('!!raw-loader?lang=typescript!./demos/basic/basic.ts'),
        html: require('!!raw-loader?lang=markup!./demos/basic/basic.html'),
        description: `
          <p>Notable change is additional css for it <code> "/datepicker/bs-datepicker.css"</code> <br></p>
          <p>There are two ways of adding css:</p>
          <ul>
            <li>Load it from CDN. Add <code>&lt;link rel="stylesheet"
              href="https://unpkg.com/ngx-bootstrap/datepicker/bs-datepicker.css"&gt;</code> to your
              <code>index.html</code></li>
            <li>Load it from <code>node_modules/ngx-bootstrap/datepicker/bs-datepicker.css</code> via package bundler
              like Angular CLI, if you're using one.
            </li>
          </ul>
        `,
        outlet: DemoDatepickerBasicComponent
      },
      {
        title: 'Initial state',
        anchor: 'date-initial-state',
        demoName: 'date-initial-state',
        component: require('!!raw-loader?lang=typescript!./demos/date-initial-state/date-initial-state.ts'),
        html: require('!!raw-loader?lang=markup!./demos/date-initial-state/date-initial-state.html'),
        outlet: DemoDatepickerDateInitialStateComponent
      },
      {
        title: 'Custom date format',
        anchor: 'format',
        demoName: 'custom-format',
        component: require('!!raw-loader?lang=typescript!./demos/custom-format/custom-format.ts'),
        html: require('!!raw-loader?lang=markup!./demos/custom-format/custom-format.html'),
        description: `
          <p>You can easily change the date format by specifying the <code>dateInputFormat</code>
            in <code>[bsConfig]</code>
          </p>
          <p>To set your own date format you can use variety of formats provided by
          <a href="https://momentjs.com/docs/#/displaying/format/" target="_blank">moment.js</a></p>
          <p>The following examples show how to use several date formats inside a form:
            <ul>
              <li><code>YYYY-MM-DD</code></li>
              <li><code>MM/DD/YYYY</code></li>
              <li><code>MMMM Do YYYY,h:mm:ss a</code></li>
            </ul>
          </p>
        `,
        outlet: DemoDatePickerCustomFormatComponent
      },
      {
        title: 'Hide on scroll',
        anchor: 'hide-on-scroll',
        demoName: 'hide-on-scroll',
        component: require('!!raw-loader?lang=typescript!./demos/hide-on-scroll/hide-on-scroll.ts'),
        html: require('!!raw-loader?lang=markup!./demos/hide-on-scroll/hide-on-scroll.html'),
        description: `
          <p>Hide the datepicker on page scroll.</p>
        `,
        outlet: DemoDatepickerHideOnScrollComponent
      },
      {
        title: 'Themes',
        anchor: 'themes',
        demoName: 'color-theming',
        component: require('!!raw-loader?lang=typescript!./demos/color-theming/color-theming.ts'),
        html: require('!!raw-loader?lang=markup!./demos/color-theming/color-theming.html'),
        description: `
        <p>Datepicker comes with some default color schemes.
        You can change it by manipulating <code>containerClass</code> property in <code>bsConfig</code> object</p>
        <p>There are 6 color schemes: <code>theme-default</code>, <code>theme-green</code>, <code>theme-blue</code>,
        <code>theme-dark-blue</code>, <code>theme-red</code>, <code>theme-orange</code></p>
      `,
        outlet: DemoDatepickerColorThemingComponent
      },
      {
        title: 'Locales',
        anchor: 'locales',
        demoName: 'change-locale',
        component: require('!!raw-loader?lang=typescript!./demos/change-locale/change-locale.ts'),
        html: require('!!raw-loader?lang=markup!./demos/change-locale/change-locale.html'),
        description: `
          <p>Datepicker can use different locales. <br>It's possible to change a locale by calling
          <code>use</code>
          method of <code>BsLocaleService</code>, list of available locales is in dropdown below.</p>
          <p>To use a different locale, you have to import it from <code>ngx-bootstrap/chronos</code> first, then
          define it in your <code>@NgModule</code> using function <code>defineLocale</code></p>
          <p>Example: </p>
          <code>import { defineLocale } from 'ngx-bootstrap/chronos';</code><br>
          <code>import { deLocale } from 'ngx-bootstrap/locale';</code><br>
          <code>defineLocale('de', deLocale);</code>
          <br>
          <br>
        `,
        outlet: DemoDatepickerChangeLocaleComponent
      },
      {
        title: 'Min-max',
        anchor: 'min-max',
        demoName: 'min-max',
        component: require('!!raw-loader?lang=typescript!./demos/min-max/min-max.ts'),
        html: require('!!raw-loader?lang=markup!./demos/min-max/min-max.html'),
        description: `
          <p>You can set min and max date of datepicker/daterangepicker using <code>minDate</code> and
          <code>maxDate</code> properties</p>
          <p>In the following example <code>minDate</code> is set to yesterday and <code>maxDate</code>
          to the current day in the next week</p>`,
        outlet: DemoDatepickerMinMaxComponent
      },
      {
        title: 'Disabled',
        anchor: 'disabled-datepicker',
        demoName: 'disabled',
        component: require('!!raw-loader?lang=typescript!./demos/disabled/disabled.ts'),
        html: require('!!raw-loader?lang=markup!./demos/disabled/disabled.html'),
        description: `<p>If you want to disable datepicker's or daterangepicker's content set <code>isDisabled</code> property to true</p>`,
        outlet: DemoDatepickerDisabledComponent
      },
      {
        title: 'Forms',
        anchor: 'forms',
        demoName: 'forms',
        component: require('!!raw-loader?lang=typescript!./demos/forms/forms.ts'),
        html: require('!!raw-loader?lang=markup!./demos/forms/forms.html'),
        description: `<p>Datepicker and daterangepicker can be used in forms. Keep in mind that
          value of <code>ngModel</code> is <code>Date</code> object for datepicker and array of 2 
          <code>Date</code> objects for daterangepicker</p>`,
        outlet: DemoDatepickerFormsComponent
      },
      {
        title: 'Reactive forms',
        anchor: 'reactive-forms',
        demoName: 'reactive-forms',
        component: require('!!raw-loader?lang=typescript!./demos/reactive-forms/reactive-forms.ts'),
        html: require('!!raw-loader?lang=markup!./demos/reactive-forms/reactive-forms.html'),
        outlet: DemoDatepickerReactiveFormsComponent
      },
      {
        title: 'Visibility methods',
        anchor: 'visibility-methods',
        demoName: 'visibility-methods',
        component: require('!!raw-loader?lang=typescript!./demos/visibility-methods/visibility-methods.ts'),
        html: require('!!raw-loader?lang=markup!./demos/visibility-methods/visibility-methods.html'),
        description: `<p>You can manage datepicker's state by using its <code>show()</code>, <code>hide()</code> and <code>toggle()</code> methods</p>`,
        outlet: DemoDatepickerVisibilityMethodsComponent
      },
      {
        title: 'Placement',
        anchor: 'placement',
        demoName: 'placement',
        component: require('!!raw-loader?lang=typescript!./demos/placement/placement.ts'),
        html: require('!!raw-loader?lang=markup!./demos/placement/placement.html'),
        description: `<p>Add <code>placement</code> property if you want to change placement</p>`,
        outlet: DemoDatepickerPlacementComponent
      },
      {
        title: 'Config method',
        anchor: 'config-method',
        demoName: 'config-method',
        component: require('!!raw-loader?lang=typescript!./demos/config-method/config-method.ts'),
        html: require('!!raw-loader?lang=markup!./demos/config-method/config-method.html'),
        description: `<p>You can manage datepicker's options by using its <code>setConfig()</code> method</p>`,
        outlet: DemoDatepickerConfigMethodComponent
      },
      {
        title: 'Visibility Events',
        anchor: 'visibility-events',
        demoName: 'visibility-events',
        component: require('!!raw-loader?lang=typescript!./demos/visibility-events/visibility-events.ts'),
        html: require('!!raw-loader?lang=markup!./demos/visibility-events/visibility-events.html'),
        description: `<p>You can subscribe to datepicker's visibility events</p>`,
        outlet: DemoDatePickerVisibilityEventsComponent
      },
      {
        title: 'Value change event',
        anchor: 'value-change-event',
        demoName: 'value-change-event',
        component: require('!!raw-loader?lang=typescript!./demos/value-change-event/value-change-event.ts'),
        html: require('!!raw-loader?lang=markup!./demos/value-change-event/value-change-event.html'),
        description: `<p>You can subscribe to datepicker's value change event (<code>bsValueChange</code>).</p>`,
        outlet: DemoDatepickerValueChangeEventComponent
      },
      {
        title: 'Config properties',
        anchor: 'config-object',
        demoName: 'config-object',
        component: require('!!raw-loader?lang=typescript!./demos/config-object/config-object.ts'),
        html: require('!!raw-loader?lang=markup!./demos/config-object/config-object.html'),
        description: `<p>You can configure the datepicker via its <code>bsConfig</code> option</p>`,
        outlet: DemoDatePickerConfigObjectComponent
      },
      {
        title: 'Outside click',
        anchor: 'outside-click',
        demoName: 'outside-click',
        component: require('!!raw-loader?lang=typescript!./demos/outside-click/outside-click.ts'),
        html: require('!!raw-loader?lang=markup!./demos/outside-click/outside-click.html'),
        description: `<p>Datepicker closes after outside click by default. To change 
          this behavior, use <code>outsideClick</code> property.</p>`,
        outlet: DemoDatepickerOutsideClickComponent
      },
      {
        title: 'IsOpen property',
        anchor: 'is-open',
        demoName: 'is-open',
        component: require('!!raw-loader?lang=typescript!./demos/is-open/is-open.ts'),
        html: require('!!raw-loader?lang=markup!./demos/is-open/is-open.html'),
        description: `<p>The datepicker's closed by default. To change this behavior, use <code>isOpen</code> property.</p>`,
        outlet: DemoDatepickerIsOpenComponent
      },
      {
        title: 'Triggers',
        anchor: 'triggers',
        demoName: 'triggers',
        component: require('!!raw-loader?lang=typescript!./demos/triggers/triggers.ts'),
        html: require('!!raw-loader?lang=markup!./demos/triggers/triggers.html'),
        description: `<p>Use different triggers ( for example <code>keydown</code>, <code>mouseenter</code>, <code>dblclick</code> ) to interact with datepicker</p>`,
        outlet: DemoDatepickerTriggersComponent
      }
    ]
  },
  {
    name: 'API Reference',
    anchor: 'api-reference',
    outlet: ApiSectionsComponent,
    content: [
      {
        title: 'BsDatepickerDirective',
        anchor: 'bs-datepicker-component',
        outlet: NgApiDocComponent
      },
      {
        title: 'BsDaterangepickerDirective',
        anchor: 'bs-daterangepicker',
        outlet: NgApiDocComponent
      },
      {
        title: 'BsDatepickerConfig',
        anchor: 'bs-datepicker-config',
        outlet: NgApiDocConfigComponent
      }
    ]
  }
];

export const demoComponentContentOld: ContentSection[] = [
  {
    name: 'Usage',
    anchor: 'usage',
    outlet: DemoTopSectionComponent,
    content: {
      doc: require('!!raw-loader?lang=typescript!./docs/usageOld.md')
    }
  },
  {
    name: 'Examples',
    anchor: 'examples-old',
    outlet: ExamplesComponent,
    componentName: 'datepicker',
    content: [
      {
        title: 'Basic',
        anchor: 'basic-old',
        demoName: 'old',
        component: require('!!raw-loader?lang=typescript!./demos/old/old.ts'),
        html: require('!!raw-loader?lang=markup!./demos/old/old.html'),
        outlet: DatepickerDemoComponent
      }
    ]
  },
  {
    name: 'API Reference',
    anchor: 'api-reference',
    outlet: ApiSectionsComponent,
    content: [
      {
        title: 'DatePickerComponent',
        anchor: 'datepicker-component',
        outlet: NgApiDocComponent
      }
    ]
  }
];
