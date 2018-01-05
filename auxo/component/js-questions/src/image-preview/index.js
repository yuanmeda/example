import ko from 'knockout';
import {Model} from './Model.js';
import template from './tpl.html';
import './binding';

ko.components.register('x-qas-image-preview', {
  viewModel: Model,
  template
});