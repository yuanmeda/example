import tpl from './tpl.html';
import ko from 'knockout';

const ViewModel = function(first, last) {
  this.firstName = ko.observable(first);
  this.lastName = ko.observable(last);

  this.fullName = ko.pureComputed(function () {
    return this.firstName() + " " + this.lastName();
  }, this);
};

ko.components.register("course-knowledgemap", {
  viewModel: ViewModel,
  template: tpl
});
