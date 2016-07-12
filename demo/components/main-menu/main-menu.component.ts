import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, NavigationEnd} from '@angular/router';

import {routes} from './../../config';
import {SearchFilterPipe} from './search-filter.pipe';
import {Ng2BootstrapTheme, Ng2BootstrapConfig} from '../../../components/ng2-bootstrap-config';

// webpack html imports
let template = require('./main-menu.template.html');

@Component({
  selector: 'main-menu',
  template,
  directives: [ROUTER_DIRECTIVES],
  pipes: [SearchFilterPipe]
})

export class MainMenuComponent {
  public isBs3:boolean = Ng2BootstrapConfig.theme === Ng2BootstrapTheme.BS3;
  public routes:any = routes;
  public search:any = {};
  public hash:string = '';

  public constructor(private router:Router) {
    this.router.events.subscribe((event:any) => {
      if (event instanceof NavigationEnd) {
        this.hash = event.url;
      }
    });
  }

  public isActive(link:string):boolean {
    return this.hash.substring(1) === link;
  }
}
