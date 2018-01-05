import $ from 'jquery';
import {ajax} from '../ajax';

/*
* 公共参数
* {
*   static_host,
*   assist_gw_host,
*   project_domain
* }
*
* 学时榜
* 学时榜在总排行和单场排行都有
* 传入的参数：
* {
*   rank_range, ['all' | 'single']
*   rank_display: 'hour' 默认为hour
* }
*
* 成绩榜
* 只有单场排行有成绩榜
* {
*   rank_range: 'single',
*   rank_display: 'score', 必选
*   exam_type,  ['pk-exam' | 'normal-exam' | 'periodic-exam']
*   exam_id,
*   project_id
* }
*
* */
function Model(params){
  const static_host = params.static_host;
  const assist_gw_host = params.assist_gw_host;
  const project_domain = params.project_domain;
  const custom_type = params.custom_type;
  const custom_id = params.custom_id;
  const rank_range = params.rank_range || 'all'; // 排行范围
  let rank_display = params.rank_display || 'hour'; // 单/总榜范围下的“学时”、“成绩”、“积分”
  let project_id = params.project_id;
  let exam_type = params.exam_type; // 考试类型（成绩榜用）
  let exam_id = params.exam_id; // 考试id
  const vm = this;
  const max_viewable_dimensions = 5;
  let list_start = 1;
  let page_size = 10;

  // todo 测试成绩榜模拟数据
  /*rank_display = 'score';
  exam_type = 'normal-exam';
  project_id = '1326';
  exam_id = '9238843b-a475-4452-a477-5092ecdc52ca';*/

  vm.rank_range = rank_range;
  vm.rank_display = ko.observable(rank_display); // 单/总榜范围下的“学时”、“成绩”、“积分”
  vm.curr_rank_cate = ko.observable(); // 学时/积分的排序
  vm.dimensions = ko.observableArray([]); // 所有有效维度，enable为true
  vm.viewable_dimensions = ko.observableArray([]); // 可以显示在tab上的维度
  vm.curr_dimension = ko.observable({});
  vm.date_dimension_config = ko.observableArray([]);
  vm.curr_date_dim_conf = ko.observable({});
  vm.list = ko.observableArray();
  vm.is_last_page = ko.observable();
  vm.my_rank = ko.observable('');
  vm.my_minute = ko.observable('');
  vm.my_exceed = ko.observable('');
  vm.my_score = ko.observable(''); // 测评成绩
  vm.my_cost_minutes = ko.observable(''); // 用时分
  vm.my_cost_seconds = ko.observable(''); // 用时秒
  vm.is_admin_config_error = ko.observable(false); // 后台配置是否错误
  vm.is_loading = ko.observable(true);
  vm.list_blank_img = `${static_host}auxo/component/js-course-detail-pk/images/ico-nopk.png`;
  vm.list_blank_message = ko.observable(i18nHelper.getKeyValue('rank_page.list_empty.no_data'));

  vm.change_dimension = change_dimension;
  vm.on_dimension_select = on_dimension_select;
  vm.change_date_dim_conf = change_date_dim_conf;
  vm.load_more = load_more;

  get_configs()
    .pipe(get_dimensions)
    .pipe(() =>{
      // 配置信息是否完善，如果不完善，不加载列表数据
      let def = $.Deferred();
      if (vm.dimensions().length === 0 || vm.date_dimension_config().length === 0) {
        vm.list_blank_message(i18nHelper.getKeyValue('rank_page.list_empty.no_config'));
        vm.is_admin_config_error(true);
        def.reject();
      } else {
        def.resolve();
      }
      return def.promise();
    })
    .pipe(() =>{
      return get_list(1);
    })
    .pipe(() =>{
      vm.is_loading(false);
      on_page_scroll_height_changed();
    }, () =>{
      vm.is_loading(false);
      on_page_scroll_height_changed();
    });

  function get_list(start){
    const dimension = vm.curr_dimension();
    const rank_type = dimension.ranking_type;
    const date_config = vm.curr_date_dim_conf();
    const rank_id = vm.curr_rank_cate().id;
    const level = dimension.level;
    const tag = date_config.id;
    let data;
    // 查询条件设置
    switch (vm.curr_rank_cate().name) {
      case 'hour':
        // 学习时长排行参数
        data = {
          rank_id,
          level,
          tag,
          start
        };
        if (rank_range === 'single') {
          data.class_id = `${project_id}-${custom_type}-${custom_id}`;
        }
        break;
      case 'score':
        // 学习成绩排行参数
        data = {
          rank_id,
          level,
          tag,
          start,
          exam_type,
          exam_id: `${project_id}-${exam_id}`
        };
        break;
    }
    return ajax(`${assist_gw_host}/${project_domain}/ranks/${rank_type}`, {
      type: 'GET',
      data
    })
      .then(res =>{
        // 确保起始数一致
        list_start = start;
        const user_info = res.user_info;
        // 统计信息
        switch (vm.curr_rank_cate().name) {
          case 'hour':
            // 学时榜
            vm.my_rank(user_info.rank);
            vm.my_minute(parse_my_num(user_info.my_score).toFixed(0));
            vm.my_exceed(user_info.score_rate);
            break;
          case 'score':
            // 成绩榜
            let cost_time = user_info.cost_time || 0;
            let cost_minutes = 0;
            let cost_seconds = 0;
            cost_minutes = window.parseInt(cost_time / 60);
            cost_seconds = window.parseInt(cost_time % 60);
            vm.my_score(parse_my_num(user_info.my_score).toFixed(2));
            vm.my_cost_minutes(cost_minutes);
            vm.my_cost_minutes(cost_seconds);
            vm.my_rank(user_info.rank);
            vm.my_exceed(user_info.score_rate);
            break;
        }
        vm.is_last_page(res.is_last_page);
        if (start > 1) {
          // 追加数据
          $.each(res.data, (idx, data) =>{
            vm.list.push(data);
          });
        } else {
          // 重置数组
          vm.list(res.data);
        }
      });
  }

  /*获取维度列表*/
  function get_dimensions(){
    return ajax(`${assist_gw_host}/v1/configs`)
      .then(res =>{
        res = res.sort(function(curr, next){
          return curr.sort_num - next.sort_num < 0;
        });
        const available_res = [];
        $.each(res, (idx, dimension) =>{
          if (dimension.enable) {
            available_res.push(dimension);
          }
        });
        vm.curr_dimension(available_res[0]);
        vm.viewable_dimensions(available_res.slice(0, max_viewable_dimensions));
        vm.dimensions(available_res);
      });
  }

  /*
  * 页面滚动高度发生变化后通知父页面
  * 本页面用于iframe嵌套时使用
  *
  * 数据格式：
  * {
  *   event,  事件名
  *   data  数据，任意格式
  * }
  *
  * */
  function on_page_scroll_height_changed(){
    window.setTimeout(() =>{
      let scroll_height = window.document.documentElement.scrollHeight;
      window.parent.postMessage(JSON.stringify({
        "type": '$resize',
        data: {
          "width": $('body').width() + 'px',
          "height": $('body').height() + 'px'
        }
      }), '*');
    }, 50);
  }

  /**
   * 获取维度配置
   * @returns {Promise}
   */
  function get_configs(){
    return ajax(`${assist_gw_host}/v1/configs/displays`)
      .then(res =>{
        let curr_rank_cate;
        // 调整rank_display
        if (rank_range === 'all') {
          // 总榜
          if (vm.rank_display() === 'score') {
            // 总榜没有成绩
            // todo 暂时设置成默认的学时
            vm.rank_display('hour');
          }
        }
        // 排行范围
        // 根据range和display确定cate
        if (rank_range === 'all') {
          curr_rank_cate = find_config(res.all_rank_config, vm.rank_display());
        } else {
          curr_rank_cate = find_config(res.single_rank_config, vm.rank_display());
        }
        vm.curr_rank_cate(curr_rank_cate);

        // 时间
        let date_dim_confs = [];
        $.each(res.date_dimension_config, (idx, conf) =>{
          if (!conf.enable) {
            return;
          }
          // 国际化
          conf.label = i18nHelper.getKeyValue('rank_page.date_dim.' + conf.name);
          if (conf.name === 'week') {
            date_dim_confs.unshift(conf);
          } else {
            date_dim_confs.push(conf);
          }
        });
        vm.date_dimension_config(date_dim_confs);
        vm.curr_date_dim_conf(date_dim_confs[0] || null);
      });
  }

  function find_config(configs, c_name){
    let i = 0, ln = configs.length;
    for (; i < ln; i++) {
      if (configs[i].name === c_name) {
        return configs[i];
      }
    }
    return null;
  }

  /*更改排行榜维度*/
  function change_dimension(dimension){
    vm.curr_dimension(dimension);
    vm.is_loading(true);
    get_list(1)
      .always(() =>{
        vm.is_loading(false);
        on_page_scroll_height_changed();
      });
  }

  /*更改日期配置*/
  function change_date_dim_conf(date_conf){
    vm.curr_date_dim_conf(date_conf);
    vm.is_loading(true);
    get_list(1)
      .always(() =>{
        vm.is_loading(false);
        on_page_scroll_height_changed();
      });
  }

  /*维度select菜单选中事件*/
  function on_dimension_select(data, event){
    const target_id = event.target.value;
    const list = vm.dimensions();
    let dimension;
    for (let i = 0, ln = list.length; i < ln; i++) {
      dimension = list[i];
      if (dimension.id === target_id) {
        break;
      }
    }
    change_dimension(dimension);
  }

  /*提取 '10分钟' 的数字*/
  function parse_my_num(res_str){
    let num = window.parseFloat(res_str);
    if (window.isNaN(num)) {
      num = 0;
    }
    return num;
  }

  /*加载更多*/
  function load_more(){
    list_start += page_size;
    vm.is_loading(true);
    return get_list(list_start)
      .always(() =>{
        vm.is_loading(false);
        on_page_scroll_height_changed();
      });
  }


}


export {Model}