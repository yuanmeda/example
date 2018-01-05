import ko from 'knockout';
import {Model} from './model.js';
import tpl from './tpl.html';

ko.components.register("x-pk-choose", {
  viewModel: Model,
  template: tpl
});