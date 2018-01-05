import ko from 'knockout';
import {Model} from './Model.js';
import template from './tpl.html';

ko.components.register("x-qas-reply", {
  viewModel: Model,
  template: template
});