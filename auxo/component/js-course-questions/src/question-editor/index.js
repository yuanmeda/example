import ko from 'knockout';
import {Model} from './Model.js';
import tpl from './tpl.html';

ko.components.register('x-qas-course-q-editor', {
  viewModel: Model,
  template: tpl
});