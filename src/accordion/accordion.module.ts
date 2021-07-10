import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';

import { AccordionComponent } from './accordion.component';
import { AccordionPanelComponent } from './accordion-group.component';

@NgModule({
  imports: [CommonModule],
  declarations: [AccordionComponent, AccordionPanelComponent],
  exports: [AccordionComponent, AccordionPanelComponent]
})
export class AccordionModule {
  static forRoot(): ModuleWithProviders<AccordionModule> {
    return { ngModule: AccordionModule, providers: [] };
  }
}
