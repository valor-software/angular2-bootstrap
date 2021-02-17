/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { Schema } from './schema';
import { WorkspaceProject, WorkspaceSchema } from '@schematics/angular/utility/workspace-models';

import {
  addModuleImportToRootModule,
  addPackageToPackageJson,
  addStyleToTarget,
  getProjectFromWorkspace,
  installPackageJsonDependencies
} from '../utils';

import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';
import { getProjectMainFile } from '../utils/project-main-file';
import { hasNgModuleImport } from '../utils/ng-module-imports';


const bootstrapStylePath = `./node_modules/bootstrap/dist/css/bootstrap.min.css`;
const datePickerStylePath = `./node_modules/ngx-bootstrap/datepicker/bs-datepicker.css`;
const datepickerComponentName = 'datepicker';
const bsName = 'ngx-bootstrap';

const components: { [key: string]: { moduleName: string; link: string; animated?: boolean } } = {
  accordion: { moduleName: 'AccordionModule', link: `${bsName}/accordion`, animated: true },
  alerts: { moduleName: 'AlertModule', link: `${bsName}/alert` },
  buttons: { moduleName: 'ButtonsModule', link: `${bsName}/buttons` },
  carousel: { moduleName: 'CarouselModule', link: `${bsName}/carousel` },
  collapse: { moduleName: 'CollapseModule', link: `${bsName}/collapse`, animated: true },
  datepicker: { moduleName: 'BsDatepickerModule', link: `${bsName}/datepicker`, animated: true },
  dropdowns: { moduleName: 'BsDropdownModule', link: `${bsName}/dropdown`, animated: true },
  modals: { moduleName: 'ModalModule', link: `${bsName}/modal` },
  pagination: { moduleName: 'PaginationModule', link: `${bsName}/pagination` },
  popover: { moduleName: 'PopoverModule', link: `${bsName}/popover` },
  progressbar: { moduleName: 'ProgressbarModule', link: `${bsName}/progressbar` },
  rating: { moduleName: 'RatingModule', link: `${bsName}/rating` },
  sortable: { moduleName: 'SortableModule', link: `${bsName}/sortable` },
  tabs: { moduleName: 'TabsModule', link: `${bsName}/tabs` },
  timepicker: { moduleName: 'TimepickerModule', link: `${bsName}/timepicker` },
  tooltip: { moduleName: 'TooltipModule', link: `${bsName}/tooltip` },
  typeahead: { moduleName: 'TypeaheadModule', link: `${bsName}/typeahead`, animated: true }
};

export default async function (options: Schema): Promise<Rule> {
  const componentName = options.component
    ? options.component
    : options['--'] && options['--'][1];

  return chain([
    addPackageJsonDependencies(),
    installPackageJsonDependencies(),
    (!componentName || componentName === datepickerComponentName)
      ? await addStyles(options, insertCommonStyles)
      : await addStyles(options, insertBootstrapStyles),
    componentName
      ? await addModuleOfComponent(options.project, componentName)
      : noop(),
    addAnimationModule(options.project, componentName)
  ]);
}

function addModuleOfComponent(projectName: string | undefined, componentName: string): Rule {
  return async (host: Tree, context: SchematicContext): Promise<Rule> => {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, projectName);
    const appModulePath = getAppModulePath(host, getProjectMainFile(project));

    if (componentName && components[componentName]) {
      if (hasNgModuleImport(host, appModulePath, components[componentName].moduleName)) {
        context.logger.warn(`Could not set up ${components[componentName].moduleName} because it already imported.`);
        return;
      }

      addModuleImportToRootModule(
        host, `${components[componentName].moduleName}.forRoot()`, components[componentName].link, project
      );
    }

    // return host;
  };
}

function addPackageJsonDependencies(): Rule {
  return (host: Tree, context: SchematicContext) => {
    const dependencies: { name: string; version: string }[] = [
      { name: 'bootstrap', version: '4.1.1' },
      { name: 'ngx-bootstrap', version: '^4.1.1' }
    ];

    dependencies.forEach(dependency => {
      addPackageToPackageJson(host, dependency.name, `${dependency.version}`);
      context.logger.log('info', `✅️ Added "${dependency.name}`);
    });

    return host;
  };
}

export function addStyles(options: Schema, insertStyle: (project, host, workspace) => void): Rule {
  return async function (host: Tree) {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);

    insertStyle(project, host, workspace);
    // return host;
  };
}

function insertBootstrapStyles(project: WorkspaceProject, host: Tree, workspace: WorkspaceSchema) {
  addStyleToTarget(project, 'build', host, bootstrapStylePath, workspace);
  addStyleToTarget(project, 'test', host, bootstrapStylePath, workspace);
}

function insertCommonStyles(project: WorkspaceProject, host: Tree, workspace: WorkspaceSchema) {
  addStyleToTarget(project, 'build', host, datePickerStylePath, workspace);
  addStyleToTarget(project, 'test', host, datePickerStylePath, workspace);

  insertBootstrapStyles(project, host, workspace);
}

function addAnimationModule(projectName: string | undefined, componentName: string): Rule {
  return async (host: Tree): Promise<Rule> => {
    if (!(!componentName || components[componentName].animated)) {
      // return host;
      return;
    }

    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, projectName);

    addModuleImportToRootModule(host, 'BrowserAnimationsModule', '@angular/platform-browser/animations', project);

    // return host;
  };
}
