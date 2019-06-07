import { DemoRatingBasicComponent } from './demos/basic/basic';
import { DemoRatingCustomComponent } from './demos/custom/custom';
import { DemoRatingDynamicComponent } from './demos/dynamic/dynamic';
import { DemoRatingSelectOnEnterComponent } from './demos/select-on-enter/select-on-enter';

import { ContentSection } from '../../docs/models/content-section.model';
import { DemoTopSectionComponent } from '../../docs/demo-section-components/demo-top-section/index';
import { ExamplesComponent } from '../../docs/demo-section-components/demo-examples-section/index';
import { ApiSectionsComponent } from '../../docs/demo-section-components/demo-api-section/index';

import { NgApiDocComponent } from '../../docs/api-docs';

export const demoComponentContent: ContentSection[] = [
  {
    name: 'Usage',
    anchor: 'usage',
    outlet: DemoTopSectionComponent,
    content: {
      doc: require('!!raw-loader!./docs/usage.md')
    }
  },
  {
    name: 'Examples',
    anchor: 'examples',
    outlet: ExamplesComponent,
    content: [
      {
        title: 'Basic rating',
        anchor: 'rating-basic',
        component: require('!!raw-loader!./demos/basic/basic'),
        html: require('!!raw-loader!./demos/basic/basic.html'),
        outlet: DemoRatingBasicComponent
      },
      {
        title: 'Dynamic rating',
        anchor: 'rating-dynamic',
        component: require('!!raw-loader!./demos/dynamic/dynamic'),
        html: require('!!raw-loader!./demos/dynamic/dynamic.html'),
        outlet: DemoRatingDynamicComponent
      },
      {
        title: 'Custom icons',
        anchor: 'rating-custom',
        component: require('!!raw-loader!./demos/custom/custom'),
        html: require('!!raw-loader!./demos/custom/custom.html'),
        outlet: DemoRatingCustomComponent
      },
      {
        title: 'Select on enter',
        description: `Key navigation example. Focus on rating and use arrow keys to set its value,
          then press <code>Enter</code> to select the value, after this, the rating state will be changed to readonly.`,
        anchor: 'select-on-enter',
        component: require('!!raw-loader!./demos/select-on-enter/select-on-enter'),
        html: require('!!raw-loader!./demos/select-on-enter/select-on-enter.html'),
        outlet: DemoRatingSelectOnEnterComponent
      }
    ]
  },
  {
    name: 'API Reference',
    anchor: 'api-reference',
    outlet: ApiSectionsComponent,
    content: [
      {
        title: 'RatingComponent',
        anchor: 'rating-component',
        outlet: NgApiDocComponent
      }
    ]
  }
];
