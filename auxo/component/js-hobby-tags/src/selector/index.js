import ko from 'knockout';
import {Model as viewModel} from './Model';
import template from './tpl.html';

ko.components.register('x-hobby-tags-selector', {
  viewModel,
  template
});