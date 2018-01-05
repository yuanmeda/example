(function (ko,$) {
'use strict';

ko = 'default' in ko ? ko['default'] : ko;
$ = 'default' in $ ? $['default'] : $;

function Model(params) {
  var vm = this;
  var static_host = params.static_host;
  var el_recommend_gw_host = params.el_recommend_gw_host;
  var project_domain = params.project_domain;
  var auxo_channel_host = params.auxo_channel_host;
  var course_id = params.course_id;
  var resource_conf_map = {};
  var courses = [];
  var page_num = 1;
  var page_size = 4;
  var max_count = 32;
  var total_pages = void 0;

  vm.has_more_pages = ko.observable(false);
  vm.empty_img = static_host + '/auxo/component/js-course-detail-pk/images/ico-nopk.png';
  vm.is_loading = ko.observable(true);
  vm.courses = ko.observableArray();
  vm.default_cover = static_host + '/auxo/front/channel/images/default_image.png';

  vm.page_down = page_down;
  vm.page_up = page_up;

  get_group_names().pipe(function () {
    return get_courses(0);
  }).pipe(function () {
    vm.is_loading(false);
  });

  function get_courses(page_no) {
    return $.ajax({
      url: el_recommend_gw_host + '/v1/recommends/actions/get_by_tag',
      type: 'GET',
      data: {
        resource_id: course_id,
        page_size: max_count,
        page_no: page_no
      }
    }).pipe(function (res) {
      $.each(res.items, function (i, resource) {
        var conf = void 0,
            url = void 0;
        conf = resource_conf_map[resource.type];
        if (!conf) {
          return;
        }
        url = conf.info_url;
        url = url.replace('${project_code}', project_domain).replace('${data.resource_id}', resource.resource_id);
        resource.url = url;
        courses.push(resource);
      });
      vm.courses(pagination(page_num, page_size));
      total_pages = Math.ceil(courses.length / page_size);
      vm.has_more_pages(total_pages > 1);
    });
  }

  function pagination(page_num, page_size) {
    var offset = (page_num - 1) * page_size;
    var list = courses.slice(offset, page_size + offset);
    if (page_num > 1 && list.length < page_size) {
      list = courses.slice(courses.length - page_size, courses.length);
    }
    return list;
  }

  function get_group_names() {
    return $.get(auxo_channel_host + '/v1/resource_config/types', {
      domain_is_same: !!window.selfUrl }).pipe(function (res) {
      $.each(res, function (i, conf) {
        resource_conf_map[conf.unit_type] = conf;
      });
    });
  }

  function page_down() {
    page_num--;
    if (page_num < 1) {
      page_num = total_pages;
    }
    vm.courses(pagination(page_num, page_size));
  }

  function page_up() {
    page_num++;
    if (page_num > total_pages) {
      page_num = 1;
    }
    vm.courses(pagination(page_num, page_size));
  }
}

var template = "<div class=\"course-recommend-bar\">\r\n  <h1 data-bind=\"translate:{key: 'course_recommend_bar.title'}\"></h1>\r\n  <!--ko if:courses().length-->\r\n  <div class=\"crb-bar\">\r\n\r\n    <!--ko if:has_more_pages()-->\r\n    <span class=\"alter-prev\" data-bind=\"click:page_down\"></span>\r\n    <span class=\"alter-next\" data-bind=\"click:page_up\"></span>\r\n    <!--/ko-->\r\n\r\n    <div class=\"crb-list\">\r\n      <ul>\r\n        <!--ko foreach:courses-->\r\n        <li>\r\n          <a data-bind=\"attr:{href:url,title:title}\">\r\n            <span class=\"pic\"><img width=\"150\" height=\"100\" data-bind=\"defimg:$component.default_cover,src:cover_url\"></span>\r\n            <span class=\"title\" data-bind=\"text:title\"></span>\r\n          </a>\r\n        </li>\r\n        <!--/ko-->\r\n      </ul>\r\n    </div>\r\n  </div>\r\n  <!--/ko-->\r\n\r\n  <!--ko if:!courses().length-->\r\n  <div class=\"crb-empty\">\r\n    <img data-bind=\"attr:{src:empty_img}\">\r\n    <span data-bind=\"translate:{key: 'course_recommend_bar.empty'}\"></span>\r\n  </div>\r\n  <!--/ko-->\r\n</div>";

ko.bindingHandlers.defimg = {
  update: function update(element, valueAccessor, allBindings, viewModel, bindingContext) {
    element.src = allBindings().src;
    element.onerror = function () {
      element.src = valueAccessor();
      element.onerror = null;
    };
  }
};

ko.components.register('x-course-recommend-bar', {
  viewModel: Model,
  template: template
});

}(ko,$));
