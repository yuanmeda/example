import tpl from './knowledgemap.html';
import ko from 'knockout';

const ViewModel = function (params) {
  // const host = 'construct-courses.dev.web.nd';
  const host = params.host.split('http://')[1];
  const config = {
    id: params.courseId,
    // id: 'caaa42a4-239d-4274-a6f2-b384dde6db5a',
    auth: btoa(Nova.getMacToken('GET', `/#!/public/coursesmap`, `${host}`))
  };

  this.url = ko.observable(`http://${host}/#!/public/${config.id}/coursesmap?menu=false&readonly=true&auth=${config.auth}`);
};

ko.components.register("course-knowledgemap", {
  viewModel: ViewModel,
  template: tpl
});
