import ko from 'knockout';
import {Model} from './Model.js';
import {MyAnswerModel} from './MyAnswerModel.js';
import tpl_my_answer from './tpl-my-answer.html';
import tpl from './tpl.html';

ko.components.register("x-qas-answer-mine", {
  viewModel: MyAnswerModel,
  template: tpl_my_answer
});

ko.components.register("x-qas-answer", {
  viewModel: Model,
  template: tpl
});
