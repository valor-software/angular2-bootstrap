import { DemoTooltipAdaptivePositionComponent } from './demos/adaptive-position/adaptive-position';
import { DemoTooltipBasicComponent } from './demos/basic/basic';
import { DemoTooltipClassComponent } from './demos/class/class';
import { DemoTooltipConfigComponent } from './demos/config/config';
import { DemoTooltipContainerComponent } from './demos/container/container';
import { DemoTooltipCustomContentComponent } from './demos/custom-content/custom-content';
import { DemoTooltipDelayComponent } from './demos/delay/delay';
import { DemoTooltipDismissComponent } from './demos/dismiss/dismiss';
import { DemoTooltipDynamicComponent } from './demos/dynamic/dynamic';
import { DemoTooltipDynamicHtmlComponent } from './demos/dynamic-html/dynamic-html';
import { DemoTooltipPlacementComponent } from './demos/placement/placement';
import { DemoTooltipStylingLocalComponent } from './demos/styling-local/styling-local';
import { DemoTooltipTriggersCustomComponent } from './demos/triggers-custom/triggers-custom';
import { DemoTooltipTriggersManualComponent } from './demos/triggers-manual/triggers-manual';

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
        description: `<p>Four positioning options are available: <code>top</code>, <code>right</code>,
          <code>bottom</code>, and <code>left</code>. Besides that, <code>auto</code> option may be
          used to detect a position that fits the component on the screen.</p>`,
        outlet: DemoTooltipPlacementComponent
      },
      {
        title: 'Disable adaptive position',
        anchor: 'adaptive-position',
        description: `
          <p>You can disable adaptive position via <code>adaptivePosition</code> input or config option</p>
        `,
        component: require('!!raw-loader?lang=typescript!./demos/adaptive-position/adaptive-position.ts'),
        html: require('!!raw-loader?lang=markup!./demos/adaptive-position/adaptive-position.html'),
        outlet: DemoTooltipAdaptivePositionComponent
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
        description: `<p>Pass a string as tooltip content</p>`,
        outlet: DemoTooltipDynamicComponent
      },
      {
        title: 'Custom content template',
        anchor: 'custom-content-template',
        component: require('!!raw-loader?lang=typescript!./demos/custom-content/custom-content.ts'),
        html: require('!!raw-loader?lang=markup!./demos/custom-content/custom-content.html'),
        description: `<p>Create <code>&lt;ng-template #myId></code> with any html allowed by Angular,
        and provide template ref <code>[tooltip]="myId"</code> as tooltip content</p>`,
        outlet: DemoTooltipCustomContentComponent
      },
      {
        title: 'Dynamic Html',
        anchor: 'dynamic-html',
        component: require('!!raw-loader?lang=typescript!./demos/dynamic-html/dynamic-html.ts'),
        html: require('!!raw-loader?lang=markup!./demos/dynamic-html/dynamic-html.html'),
        description: `<p>By using <code>[innerHtml]</code> inside <code>ng-template</code> you
          can display any dynamic html</p>`,
        outlet: DemoTooltipDynamicHtmlComponent
      },
      {
        title: 'Append to body',
        anchor: 'append-to-body',
        component: require('!!raw-loader?lang=typescript!./demos/container/container.ts'),
        html: require('!!raw-loader?lang=markup!./demos/container/container.html'),
        description: `<p>When you have some styles on a parent element that interfere with a tooltip,
          you’ll want to specify a <code>container="body"</code> so that the tooltip’s HTML will be
          appended to body. This will help to avoid rendering problems in more complex components
          (like our input groups, button groups, etc) or inside elements with <code>overflow: hidden</code></p>`,
        outlet: DemoTooltipContainerComponent
      },
      {
        title: 'Configuring defaults',
        anchor: 'config-defaults',
        component: require('!!raw-loader?lang=typescript!./demos/config/config.ts'),
        html: require('!!raw-loader?lang=markup!./demos/config/config.html'),
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
        description: `<p>You can manage tooltip using its <code>show()</code>, <code>hide()</code> and <code>toggle()</code> methods. 
          If you want to manage tooltip's state manually, use <code>triggers=""</code></p>`,
        outlet: DemoTooltipTriggersManualComponent
      },
      {
        title: 'Component level styling',
        anchor: 'styling-local',
        component: require('!!raw-loader?lang=typescript!./demos/styling-local/styling-local.ts'),
        html: require('!!raw-loader?lang=markup!./demos/styling-local/styling-local.html'),
        outlet: DemoTooltipStylingLocalComponent
      },
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
        description: `<p>Hold on cursor above button for 0,5 second or more to see delayed tooltip</p>`,
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

