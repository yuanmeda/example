import ko from 'knockout';
import {Model as viewModel} from './Model';
import template from './tpl.html';

ko.bindingHandlers.defimg = {
  update(element, valueAccessor, allBindings, viewModel, bindingContext){
    element.src = allBindings().src;
    element.onerror = function(){
      element.src = valueAccessor();
      element.onerror = null;
    };
  }
};

ko.components.register('x-course-recommend-bar', {
  viewModel,
  template
});