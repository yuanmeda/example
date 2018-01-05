import ko from 'knockout';
import Model from './model';
import tpl from './template.html';

ko.components.register('x-my-dcu', {
  viewModel: Model,
  template: tpl
});