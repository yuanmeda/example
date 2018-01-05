import ko from 'knockout';
import $ from 'jquery';

function Model(params){
  const vm = this;
  const static_host = params.static_host;
  let el_recommend_gw_host = params.el_recommend_gw_host;
  const project_domain = params.project_domain;
  const auxo_channel_host = params.auxo_channel_host;
  const course_id = params.course_id;
  const resource_conf_map = {};
  const courses = [];
  let page_num = 1;
  let page_size = 4;
  let max_count = 32;
  let total_pages;

  vm.has_more_pages = ko.observable(false);
  vm.empty_img = `${static_host}/auxo/component/js-course-detail-pk/images/ico-nopk.png`;
  vm.is_loading = ko.observable(true);
  vm.courses = ko.observableArray();
  vm.default_cover = `${static_host}/auxo/front/channel/images/default_image.png`;

  vm.page_down = page_down;
  vm.page_up = page_up;

  get_group_names()
    .pipe(()=>{
      return get_courses(0);
    })
    .pipe(()=>{
      vm.is_loading(false);
    });


  /*获取课程*/

  function get_courses(page_no){
    return $.ajax({
      url: `${el_recommend_gw_host}/v1/recommends/actions/get_by_tag`,
      type: 'GET',
      data: {
        resource_id: course_id,
        page_size:max_count,
        page_no
      }
    })
      .pipe(res=>{
        $.each(res.items, (i, resource)=>{
          let conf, url;
          conf = resource_conf_map[resource.type];
          if(!conf){return;}
          url = conf.info_url;
          url = url
            .replace('${project_code}', project_domain)
            .replace('${data.resource_id}', resource.resource_id);
          resource.url = url;
          courses.push(resource);
        });
        vm.courses(pagination(page_num, page_size));
        total_pages = Math.ceil(courses.length / page_size);
        vm.has_more_pages(total_pages > 1);
      });
  }

  function pagination(page_num, page_size){
    let offset = (page_num - 1)*page_size;
    let list = courses.slice(offset, page_size+offset);
    if(page_num > 1 && list.length < page_size){
      list = courses.slice(courses.length - page_size, courses.length);
    }
    return list;
  }

  function get_group_names(){
    return $.get(`${auxo_channel_host}/v1/resource_config/types`, {
      domain_is_same: !!window.selfUrl // false 为旧
    })
      .pipe(res=>{
        $.each(res, (i, conf)=>{
          resource_conf_map[conf.unit_type] = conf;
        });
      });
  }

  function page_down(){
    page_num --;
    if(page_num < 1){
      page_num = total_pages;
    }
    vm.courses(pagination(page_num, page_size));
  }

  function page_up(){
    page_num ++;
    if(page_num > total_pages){
      page_num = 1;
    }
    vm.courses(pagination(page_num, page_size));
  }
}

export {Model};