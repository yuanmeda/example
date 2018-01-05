import tpl from './rank.html';
import ko from 'knockout';

const ViewModel = function(params) {
  // console.dir(params);
  this.url = ko.observable(`${params.host}/${params.projectCode}/rank/display?rank_range=single&custom_type=${params.customType}&custom_id=${params.customId}`);
};

ko.components.register("course-rank", {
  viewModel: ViewModel,
  template: tpl
});
