import { BaseComponent } from './base.component';

export class LandingPo extends BaseComponent {
  pageUrl = '/';

  logoAtHeader = '.logo';
  logoAtContent = '.content-logo';
  infoButtons = '.header-list';
  sloganBs = '.slogan';
  descriptionBs = '.descr';
  versionBs = '.version';
  advantagesBs = '.advantages';
  navBtn = '.btn';

  stackoverflowUrl = 'https://stackoverflow.com/questions/tagged/ngx-bootstrap';
  githubUrl = 'https://github.com/valor-software/ngx-bootstrap';
  slackUrl = 'https://ngx-slack.herokuapp.com';

  teamUrl = 'https://github.com/valor-software';
  contributorsUrl = 'https://github.com/valor-software/ngx-bootstrap/graphs/contributors';
  mitLicenseUrl = 'https://github.com/valor-software/ngx-bootstrap/blob/development/LICENSE';
  crCommonsUrl = 'https://creativecommons.org/licenses/by/3.0/';
  originalBsUrl = 'https://getbootstrap.com/';
}
