import ko from 'knockout';

/*
 * @param params
 * {
 *   images:[]
 * }
 *
 * */
function Model(params){
  const vm = this;

  vm.images = params.images;
  vm.show_img_play = ko.observable(false);
  vm.index = ko.observable(-1);
  vm.loaded = ko.observable(false);
  vm.index.subscribe(() =>{
    vm.loaded(false);
  });

  vm.zoom_in = zoom_in;
  vm.next = next;
  vm.prev = prev;
  vm.close = close;
  vm.load = load;

  function zoom_in(index){
    vm.index(index);
    vm.show_img_play(true);
  }

  function next(){
    let idx = vm.index() + 1;
    if (idx > params.images.length - 1) {
      idx = 0;
    }
    vm.index(idx);
  }

  function prev(){
    let idx = vm.index() - 1;
    if (idx < 0) {
      idx = params.images.length - 1;
    }
    vm.index(idx);
  }

  function close(){
    vm.show_img_play(false);
    vm.index(-1);
  }

  function load(){
    vm.loaded(true);
  }
}

export {Model};