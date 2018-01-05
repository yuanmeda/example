import ko from 'knockout';
import {Model} from './model.js';
import tpl from './tpl.html';

ko.components.register("x-knowledge-strategy", {
  viewModel: Model,
  template: tpl
});