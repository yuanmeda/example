import ko from 'knockout';
import Model from './model.js';
import template from './template.html';

ko.components.register("x-sales-shopping-card", {
  viewModel: Model,
  template
});