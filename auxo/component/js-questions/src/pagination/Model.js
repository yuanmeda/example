import ko from 'knockout';

/**
 *
 * @param params
 * {
 *   page_size,
 *   total,
 *   curr_page
 * }
 * @constructor
 */
function Model(params){
  const vm = this;
  const offset = 2;

  vm.currPage = ko.observable(params.curr_page);
  vm.pageSize = params.page_size;
  vm.totalItems = ko.observable(params.total);

  vm.pages = ko.observableArray([]);
  vm.hasMore = ko.observable(false);
  vm.hasLess = ko.observable(false);
  vm.hasNext = ko.observable(false);
  vm.hasPrev = ko.observable(false);
  vm.changePage = changePage;

  watchCurrPage(vm.currPage());

  function changePage(page){
    if(page == vm.currPage()){return;}
    params.on_page_command(page);
  }

  function watchCurrPage(currPage){
    let max;
    let min = 1;
    let start, end;
    max = Math.ceil(vm.totalItems()/vm.pageSize);
    vm.hasPrev(currPage > min);
    vm.hasNext(currPage < max);
    start = currPage - offset;
    end = currPage + offset;
    if(start < min){ start = min; }
    if(end > max){ end = max; }
    vm.hasLess(start > min);
    vm.hasMore(end < max);
    let pages = [];
    let i = start;
    while(i<=end){
      pages.push(i);
      i++
    }
    vm.pages(pages);
  }
}

export {Model};