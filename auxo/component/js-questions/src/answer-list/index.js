import ko from 'knockout';
import {Model} from './Model.js';
import template from './tpl-quick-view.html';
import tpl_indep from './tpl-indep.html';

ko.components.register('x-qas-ans-li-quick-view', {
  viewModel: Model,
  template: template
});
// 问题详情
ko.components.register('x-qas-ans-indep', {
  viewModel: Model,
  template: tpl_indep
});