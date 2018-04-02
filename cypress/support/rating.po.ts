import { BaseComponent } from './base.component';

export class RatingPo extends BaseComponent {
  pageUrl = '/rating';
  pageTitle = 'Rating';
  ghLinkToComponent = 'https://github.com/valor-software/ngx-bootstrap/tree/development/src/rating';

  tagRating = 'rating';
  outputClass = '.card-block';

  exampleDemosArr = {
    basic: 'demo-rating-basic'
  };
}
