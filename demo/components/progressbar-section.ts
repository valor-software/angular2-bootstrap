/// <reference path="../../tsd.d.ts" />

import {
  Component, View,
} from 'angular2/core';
import { CORE_DIRECTIVES } from 'angular2/common';
import {Ng2BootstrapConfig, Ng2BootstrapTheme} from '../../components/ng2-bootstrap-config';

import {tabs} from '../../ng2-bootstrap';
import {ProgressbarDemo} from './progressbar/progressbar-demo';

let name = 'Progressbar';
let src = 'https://github.com/valor-software/ng2-bootstrap/blob/master/components/progressbar/progressbar.ts';

// webpack html imports
let doc = require('../../components/progressbar/readme.md');
let titleDoc = require('../../components/progressbar/title.md');

let ts = require('!!prismjs?lang=typescript!./progressbar/progressbar-demo.ts');
let templates:any = {
  [Ng2BootstrapTheme.BS3]: require('!!prismjs?lang=markup!./progressbar/progressbar-demo.html'),
  [Ng2BootstrapTheme.BS4]: require('!!prismjs?lang=markup!./progressbar/progressbar-demo-bs4.html')
};
let html = templates[Ng2BootstrapConfig.theme];

@Component({
  selector: 'progressbar-section'
})
@View({
  template: `
  <br>
  <section id="${name.toLowerCase()}">
    <div class="row"><h1>${name}<small>(<a href="${src}">src</a>)</small></h1></div>

    <hr>

    <div class="row"><div class="col-md-12">${titleDoc}</div></div>

    <div class="row">
      <h2>Example</h2>
      <div class="card card-block panel panel-default panel-body">
        <progressbar-demo></progressbar-demo>
      </div>
    </div>

    <br>

    <div class="row">
      <tabset>
        <tab heading="Markup">
          <div class="card card-block panel panel-default panel-body">
            <pre class="language-html"><code class="language-html" ng-non-bindable>${html}</code></pre>
          </div>
        </tab>
        <tab heading="TypeScript">
          <div class="card card-block panel panel-default panel-body">
            <pre class="language-typescript"><code class="language-typescript" ng-non-bindable>${ts}</code></pre>
          </div>
        </tab>
      </tabset>
    </div>

    <br>

    <div class="row">
      <h2>API</h2>
      <div class="card card-block panel panel-default panel-body">${doc}</div>
    </div>
  </section>
  `,
  directives: [ProgressbarDemo, tabs, CORE_DIRECTIVES]
})
export class ProgressbarSection {
}
