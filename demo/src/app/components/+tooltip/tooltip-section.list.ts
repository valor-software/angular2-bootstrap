import { DemoTooltipBasicComponent } from './demos/basic/basic';
import { DemoTooltipPlacementComponent } from './demos/placement/placement';
import { DemoTooltipDismissComponent } from './demos/dismiss/dismiss';
import { DemoTooltipDynamicComponent } from './demos/dynamic/dynamic';
import { DemoTooltipDynamicHtmlComponent } from './demos/dynamic-html/dynamic-html';
import { DemoTooltipContainerComponent } from './demos/container/container';
import { DemoTooltipConfigComponent } from './demos/config/config';
import { DemoTooltipTriggersCustomComponent } from './demos/triggers-custom/triggers-custom';
import { DemoTooltipTriggersManualComponent } from './demos/triggers-manual/triggers-manual';
import { DemoTooltipStylingLocalComponent } from './demos/styling-local/styling-local';
import { DemoTooltipClassComponent } from './demos/class/class';
import { DemoTooltipStylingGlobalComponent } from './demos/styling-global/styling-global';

import { ContentSection } from '../../docs/models/content-section.model';
import { DemoTopSectionComponent } from '../../docs/demo-section-components/demo-top-section/index';
import { ExamplesComponent } from '../../docs/demo-section-components/demo-examples-section/index';
import { ApiSectionsComponent } from '../../docs/demo-section-components/demo-api-section/index';

import {
  NgApiDocComponent,
  NgApiDocConfigComponent
} from '../../docs/api-docs';
import { DemoTooltipDelayComponent } from './demos/delay/delay';

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
    content: [
      {
        title: 'Basic',
        anchor: 'basic',
        component: require('!!raw-loader?lang=typescript!./demos/basic/basic.ts'),
        html: require('!!raw-loader?lang=markup!./demos/basic/basic.html'),
        outlet: DemoTooltipBasicComponent
      },
      {
        title: 'Placement',
        anchor: 'placement',
        component: require('!!raw-loader?lang=typescript!./demos/placement/placement.ts'),
        html: require('!!raw-loader?lang=markup!./demos/placement/placement.html'),
        description: `<p>Four positioning options are available: top, right, bottom, and left aligned.
          Besides that, auto option may be used to detect a position that fits the component on the screen.</p>`,
        outlet: DemoTooltipPlacementComponent
      },
      {
        title: 'Dismiss on next click',
        anchor: 'dismiss',
        component: require('!!raw-loader?lang=typescript!./demos/dismiss/dismiss.ts'),
        html: require('!!raw-loader?lang=markup!./demos/dismiss/dismiss.html'),
        description: `<p>Use the <code>focus</code> trigger to dismiss tooltips on the next click
          that the user makes.</p>`,
        outlet: DemoTooltipDismissComponent
      },
      {
        title: 'Dynamic Content',
        anchor: 'dynamic-content',
        component: require('!!raw-loader?lang=typescript!./demos/dynamic/dynamic.ts'),
        html: require('!!raw-loader?lang=markup!./demos/dynamic/dynamic.html'),
        outlet: DemoTooltipDynamicComponent
      },
      {
        title: 'Dynamic Html',
        anchor: 'dynamic-html',
        component: require('!!raw-loader?lang=typescript!./demos/dynamic-html/dynamic-html.ts'),
        html: require('!!raw-loader?lang=markup!./demos/dynamic-html/dynamic-html.html'),
        description: `<p>By using small trick you can display any dynamic html, which you got from ajax
          request for example.</p>`,
        outlet: DemoTooltipDynamicHtmlComponent
      },
      {
        title: 'Append to body',
        anchor: 'append-to-body',
        component: require('!!raw-loader?lang=typescript!./demos/container/container.ts'),
        html: require('!!raw-loader?lang=markup!./demos/container/container.html'),
        outlet: DemoTooltipContainerComponent
      },
      {
        title: 'Configuring defaults',
        anchor: 'config-defaults',
        component: require('!!raw-loader?lang=typescript!./demos/config/config.ts'),
        html: require('!!raw-loader?lang=markup!./demos/config/config.html'),
        description: `<p>When you have some styles on a parent element that interfere with a tooltip,
          you’ll want to specify a <code>container="body"</code> so that the tooltip’s HTML will be
          appended to body. This will help to avoid rendering problems in more complex components
          (like our input groups, button groups, etc) or inside elements with <code>overflow: hidden</code></p>`,
        outlet: DemoTooltipConfigComponent
      },
      {
        title: 'Custom triggers',
        anchor: 'triggers-custom',
        component: require('!!raw-loader?lang=typescript!./demos/triggers-custom/triggers-custom.ts'),
        html: require('!!raw-loader?lang=markup!./demos/triggers-custom/triggers-custom.html'),
        outlet: DemoTooltipTriggersCustomComponent
      },
      {
        title: 'Manual triggering',
        anchor: 'triggers-manual',
        component: require('!!raw-loader?lang=typescript!./demos/triggers-manual/triggers-manual.ts'),
        html: require('!!raw-loader?lang=markup!./demos/triggers-manual/triggers-manual.html'),
        description: `<p>You can manage tooltip using its <code>show()</code>, <code>hide()</code> and <code>toggle()</code> methods</p>`,
        outlet: DemoTooltipTriggersManualComponent
      },
      {
        title: 'Component level styling',
        anchor: 'styling-local',
        component: require('!!raw-loader?lang=typescript!./demos/styling-local/styling-local.ts'),
        html: require('!!raw-loader?lang=markup!./demos/styling-local/styling-local.html'),
        outlet: DemoTooltipStylingLocalComponent
      },
      /*{
        title: 'Global styling',
        anchor: 'styling-global',
        component: require('!!raw-loader?lang=typescript!./demos/styling-global/styling-global.ts'),
        html: require('!!raw-loader?lang=markup!./demos/styling-global/styling-global.html'),
        outlet: DemoTooltipStylingGlobalComponent
      },*/
      {
        title: 'Custom class',
        anchor: 'custom-class',
        component: require('!!raw-loader?lang=typescript!./demos/class/class.ts'),
        html: require('!!raw-loader?lang=markup!./demos/class/class.html'),
        outlet: DemoTooltipClassComponent
      },
      {
        title: 'Tooltip with delay',
        anchor: 'tooltip-delay',
        component: require('!!raw-loader?lang=typescript!./demos/delay/delay.ts'),
        html: require('!!raw-loader?lang=markup!./demos/delay/delay.html'),
        outlet: DemoTooltipDelayComponent
      }
    ]
  },
  {
    name: 'API Reference',
    anchor: 'api-reference',
    outlet: ApiSectionsComponent,
    content: [
      {
        title: 'TooltipDirective',
        anchor: 'tooltip-directive',
        outlet: NgApiDocComponent
      },
      {
        title: 'TooltipConfig',
        anchor: 'tooltip-config',
        outlet: NgApiDocConfigComponent
      }
    ]
  }
];

