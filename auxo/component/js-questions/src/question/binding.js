import ko from 'knockout';
import $ from 'jquery';

/*插件 http://dotdotdot.frebsite.nl/*/
ko.bindingHandlers.dot = {
  init(element, valueAccessor, allBindings, viewModel, bindingContext) {
    ko.tasks.schedule(()=>{
      let elm = $(element);
      let toggle =$('<span class="toggle"></span>');
      elm.dotdotdot({
        height: 59,
        after: toggle
      });
      elm.on('click', '.toggle', ()=>{
        let content = elm.triggerHandler("originalContent");
        elm.html('');
        elm.append(content);
        elm.off('click');
      });
    });
  }
};


ko.bindingHandlers.keywordhh = {
  init(element, valueAccessor){
    let bind_val = valueAccessor();
    let content = bind_val.content;
    let keyword = bind_val.keyword;
    let original_word, found;
    let reg_keyword = reg_char_escape(keyword);
    let reg = new RegExp(reg_keyword, 'gi');
    let striped;
    if(content === null){return;}
    if(keyword.length === 0){
      striped = [content];
    }else{
      striped = content.split(reg);
    }
    found = content.match(reg);
    original_word = found ? found[0] : '';
    $.each(striped, (i, word)=>{
      let text_keyword = document.createTextNode(original_word);
      let text_normal_word = document.createTextNode(word);
      element.appendChild(text_normal_word);
      if(i < striped.length - 1){
        let sp = document.createElement('span');
        sp.appendChild(text_keyword);
        element.appendChild(sp);
      }
    });
  }
};

ko.bindingHandlers.prewrap = {
  init(element, valueAccessor){
    let bind_val = valueAccessor();
    let content_split = bind_val.split(/\n/gi);
    $.each(content_split, (i, chunk)=>{
      let text = document.createTextNode(chunk);
      element.appendChild(text);
      if(i < content_split.length - 1){
        let br_node = document.createElement('br');
        element.appendChild(br_node);
      }
    });

  }
};

function reg_char_escape(str){
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}