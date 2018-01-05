import $ from 'jquery';
import {ajax} from '../ajax';

function Model(params){
  const vm = this;
  const api_host = params.api_host;
  const gw_host = params.gw_host;
  const pk_id = params.pk_id;
  const curr_user_id = params.curr_user_id;
  const project_domain = params.project_domain;

  // 对手user_id
  const rival_id = '';

  vm.curr_user_name = ko.observable();
  vm.curr_user_icon = ko.observable();
  vm.curr_user_from = ko.observable();
  vm.curr_user_win_rate = ko.observable();
  vm.curr_user_ranking = ko.observable();
  vm.curr_user_score = ko.observable();
  vm.matched_list = ko.observableArray();
  vm.is_loading = ko.observable(true);

  vm.change_another_group = change_another_group;
  vm.start_pk = start_pk;
  vm.play_alone = play_alone;

  random_match()
    .then(() =>{
      get_user_pk_info()
        .then(res =>{
          const user_info = res.uc_user_display_facade;
          vm.curr_user_name(user_info.display_name);
          vm.curr_user_icon(`${user_info.icon}&defaultImage=1`);
          vm.curr_user_from(user_info.org_exinfo && user_info.org_exinfo.node_name);
          if (vm.matched_list().length === 0) {
            // 有匹配到
            vm.curr_user_win_rate('--');
            vm.curr_user_ranking('--');
            vm.curr_user_score('--');
          } else {
            // 没匹配到
            vm.curr_user_win_rate(`${Math.round(res.win_rate * 100)}%`);
            let rank = res.user_rank && res.user_rank.rank;
            vm.curr_user_ranking(rank > 0 ? rank : '--');
            vm.curr_user_score(res.pk_point < 0 ? 0 : res.pk_point);
          }
        })
        .always(() =>{
          vm.is_loading(false);
        });
    }, () =>{
      vm.is_loading(false);
    });


  /*获取当前用户PK信息*/
  function get_user_pk_info(){
    return ajax(`${gw_host}/v1/pk_users`, {
      type: 'GET',
      data: {
        pk_id,
        user_id: curr_user_id
      }
    });
  }

  /*随机匹配*/
  function random_match(){
    return ajax(`${gw_host}/v2/pk_users/actions/random_match`, {
      data:{
        pk_id,
        user_number: 5
      }
    })
      .then(res =>{
        $.each(res, (index, item) =>{
          // 用户信息修改
          const pk_user_info = item.pk_user_vo;
          const total = pk_user_info.win_times + pk_user_info.lose_times + pk_user_info.draw_times;
          if (total > 0) {
            pk_user_info.win_rate = `${Math.round(pk_user_info.win_times / total * 100)}%`;
          } else {
            pk_user_info.win_rate = '0%';
          }
          // 积分预测修改
          const pk_prediction = item.pk_prediction;
          if(pk_prediction){
            pk_prediction.win_pk_point = num2str(pk_prediction.win_pk_point);
            pk_prediction.drawn_pk_point = num2str(pk_prediction.drawn_pk_point);
            pk_prediction.lose_pk_point = num2str(pk_prediction.lose_pk_point);
          }else{
            item.pk_prediction = {
              win_pk_point: '0',
              drawn_pk_point: '0',
              lose_pk_point: '0'
            };
          }
        });
        vm.matched_list(res);
      });
  }

  function num2str(num){
    num = window.parseInt(num, 10);
    if(num > 0){
      return `+${num}`;
    }
    if(num <= 0){
      return num.toString();
    }
  }

  /*换一组*/
  function change_another_group(){
    vm.is_loading(true);
    random_match()
      .always(()=>{
        vm.is_loading(false);
      });
  }

  /*开始PK*/
  function start_pk(data){
    window.location.href = window.self_host + `/${project_domain}/pk/${pk_id}/answer?rival_id=${data.pk_user_vo.user_id}`;
  }

  /*自己玩*/
  function play_alone(){
    window.location.href = window.self_host + `/${project_domain}/pk/${pk_id}/answer`;
  }
}

export {Model};