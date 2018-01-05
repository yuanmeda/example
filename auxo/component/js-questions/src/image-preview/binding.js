import ko from 'knockout';
import $ from 'jquery';

ko.bindingHandlers.imglocate = {
  init: function(element){
    ko.utils.domNodeDisposal.addDisposeCallback(element, () =>{
      $(window).off('resize.imglocate');
    });
  },
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext){
    ko.tasks.schedule(() =>{
      element = $(element);
      let win_height = $(window).height() - 50;
      let win_width = $(window).width() - 100;
      let image = element.find('img');
      let height = $(image[0]).naturalHeight(), width = $(image[0]).naturalWidth();
      locate(element, image, width, height, win_width, win_height);
      image.on('load', () =>{
        height = $(image[0]).naturalHeight();
        width = $(image[0]).naturalWidth();
        locate(element, image, width, height, win_width, win_height);
      });
      $(window).on('resize.imglocate', function(){
        win_height = $(window).height() - 50;
        win_width = $(window).width() - 100;
        locate(element, image, width, height, win_width, win_height);
      });
    });
  }
};


function locate(wrapper, image, width, height, max_width, max_height){
  let ratio;
  if (height > max_height || width > max_width) {
    if (height > width) {
      ratio = max_height / height;
      height = max_height;
      width = width * ratio;
    } else {
      ratio = max_width / width;
      width = max_width;
      height = height * ratio;
    }
  }
  image.attr({
    width,
    height
  });
  wrapper.css({
    top: (max_height + 50 - height) / 2,
    left: (max_width + 100 - width) / 2
  });
}

function natural(){
  let props = ['Width', 'Height'],
    prop;
  while (prop = props.pop()) {
    (function(natural, prop){
      $.fn[natural] = (natural in new Image()) ?
        function(){
          return this[0][natural];
        } :
        function(){
          let
            node = this[0],
            img,
            value;

          if (node.tagName.toLowerCase() === 'img') {
            img = new Image();
            img.src = node.src;
            value = img[prop];
          }
          return value;
        };
    }('natural' + prop, prop.toLowerCase()));
  }
}

natural();
