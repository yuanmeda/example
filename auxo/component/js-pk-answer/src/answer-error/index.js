import ko from 'knockout';
import {Model} from './model.js';
import tpl from './tpl.html';

ko.components.register("x-pk-answer-error", {
  viewModel: Model,
  template: tpl
});