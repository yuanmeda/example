import {Model} from './Model';
import tpl from './tpl.html';
import ko from 'knockout';

ko.bindingHandlers.costTime = {
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    let time = valueAccessor();
    let minutes = window.parseInt(time / 60);
    let seconds = window.parseInt(time % 60);
    $(element).text(`${minutes}${i18nHelper.getKeyValue('rank_page.time.minutes')}${seconds}${i18nHelper.getKeyValue('rank_page.time.seconds')}`);
  }
};

ko.components.register('x-rank-page', {
  viewModel: Model,
  template: tpl
});