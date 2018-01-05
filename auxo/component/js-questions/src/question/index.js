import ko from 'knockout';
import {Model} from './Model.js';
import template from './tpl.html';
import tpl_indep from './tpl-indep.html';
import './binding';
// 课程主页
ko.components.register("x-qas-question", {
  viewModel: Model,
  template: template
});
// 问题详情
ko.components.register("x-qas-question-indep", {
  viewModel: Model,
  template: tpl_indep
});