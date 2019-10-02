'use strict';

module.exports = {
  mode: 'modules',
  out: 'doc',
  theme: 'default',
  exclude: 'test',
  excludeNotExported: 'true',
  ignoreCompilerErrors: 'true',
  experimentalDecorators: 'true',
  emitDecoratorMetadata: 'true',
  target: 'ES5',
  moduleResolution: 'node',
  preserveConstEnums: 'true',
  stripInternal: 'true',
  suppressExcessPropertyErrors: 'true',
  suppressImplicitAnyIndexErrors: 'true',
  module: 'commonjs'
};
