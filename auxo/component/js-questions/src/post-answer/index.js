import ko from 'knockout';
import {Model} from './Model.js';
import template from './tpl.html';

ko.components.register("x-qas-post-answer", {
  viewModel: Model,
  template: template
});