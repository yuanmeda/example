import ko from 'knockout';
import $ from 'jquery';
import template_a from './template-note-style-a.html';
import template_b from './template-note-style-b.html';
import {Model} from './model';
ko.bindingHandlers.limitNoteContent = {
  init: function(element){
    const limitClassName = 'text-limit';
    let h = element.scrollHeight;
    let computedStyle = window.getComputedStyle(element);
    let lineHeight = window.parseInt(computedStyle.lineHeight);
    let lineNum;
    try{
      lineNum = Math.ceil(h/lineHeight);
    }catch(e){
      lineNum = 0;
    }
    if(lineNum > 5){
      // 超过5行
      $(element).parent().addClass(limitClassName)
    }else{
      $(element).parent().removeClass(limitClassName);
    }
    $(element).next().on('click', ()=>{
      $(element).parent().removeClass(limitClassName);
      $(this).remove();
    });
  }
};

ko.components.register("x-note-item-a", {
  viewModel: Model,
  template: template_a
});

ko.components.register("x-note-item-b", {
  viewModel: Model,
  template: template_b
});