import { DemoTooltipBasicComponent } from './basic/basic';
import { DemoTooltipFourDirectionsComponent } from './four-directions/four-directions';
import { DemoTooltipDismissComponent } from './dismiss/dismiss';
import { DemoTooltipDynamicComponent } from './dynamic/dynamic';
import { DemoTooltipConfigComponent } from './config/config';
import { DemoTooltipContainerComponent } from './container/container';
import { DemoTooltipDelayedComponent } from './delayed/delayed';
import { DemoTooltipStylingGlobalComponent } from './styling-global/styling-global';
import { DemoTooltipStylingLocalComponent } from './styling-local/styling-local';
import { DemoTooltipTriggersCustomComponent } from './triggers-custom/triggers-custom';
import { DemoTooltipTriggersManualComponent } from './triggers-manual/triggers-manual';
import { DemoTooltipDynamicHtmlComponent } from './dynamic-html/dynamic-html';

export const DEMO_COMPONENTS = [
  DemoTooltipBasicComponent,
  DemoTooltipFourDirectionsComponent,
  DemoTooltipDismissComponent,
  DemoTooltipDynamicComponent,
  DemoTooltipDynamicHtmlComponent,
  DemoTooltipDelayedComponent,
  DemoTooltipContainerComponent,
  DemoTooltipConfigComponent,
  DemoTooltipStylingGlobalComponent,
  DemoTooltipStylingLocalComponent,
  DemoTooltipTriggersCustomComponent,
  DemoTooltipTriggersManualComponent
];

export const DEMOS = {
  basic: {
    component: require('!!raw-loader?lang=typescript!./basic/basic.ts'),
    html: require('!!raw-loader?lang=markup!./basic/basic.html')
  },
  forDirections: {
    component: require('!!raw-loader?lang=typescript!./four-directions/four-directions.ts'),
    html: require('!!raw-loader?lang=markup!./four-directions/four-directions.html')
  },
  dismiss: {
    component: require('!!raw-loader?lang=typescript!./dismiss/dismiss.ts'),
    html: require('!!raw-loader?lang=markup!./dismiss/dismiss.html')
  },
  dynamic: {
    component: require('!!raw-loader?lang=typescript!./dynamic/dynamic.ts'),
    html: require('!!raw-loader?lang=markup!./dynamic/dynamic.html')
  },
  dynamicHtml: {
    component: require('!!raw-loader?lang=typescript!./dynamic-html/dynamic-html.ts'),
    html: require('!!raw-loader?lang=markup!./dynamic-html/dynamic-html.html')
  },
  container: {
    component: require('!!raw-loader?lang=typescript!./container/container.ts'),
    html: require('!!raw-loader?lang=markup!./container/container.html')
  },
  delayed: {
    component: require('!!raw-loader?lang=typescript!./delayed/delayed.ts'),
    html: require('!!raw-loader?lang=markup!./delayed/delayed.html')
  },
  config: {
    component: require('!!raw-loader?lang=typescript!./config/config.ts'),
    html: require('!!raw-loader?lang=markup!./config/config.html')
  },
  triggersCustom: {
    component: require('!!raw-loader?lang=typescript!./triggers-custom/triggers-custom.ts'),
    html: require('!!raw-loader?lang=markup!./triggers-custom/triggers-custom.html')
  },
  triggersManual: {
    component: require('!!raw-loader?lang=typescript!./triggers-manual/triggers-manual.ts'),
    html: require('!!raw-loader?lang=markup!./triggers-manual/triggers-manual.html')
  },
  stylingComponent: {
    component: require('!!raw-loader?lang=typescript!./styling-local/styling-local.ts'),
    html: require('!!raw-loader?lang=markup!./styling-local/styling-local.html')
  },
  stylingGlobal: {
    component: require('!!raw-loader?lang=typescript!./styling-global/styling-global.ts'),
    html: require('!!raw-loader?lang=markup!./styling-global/styling-global.html')
  }
};
