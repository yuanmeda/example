import ko from 'knockout';
import $ from 'jquery';
import Model from './model.js';
import template from './template.html';


ko.components.register("x-common-catalogs", {
  viewModel: Model,
  template: template
});