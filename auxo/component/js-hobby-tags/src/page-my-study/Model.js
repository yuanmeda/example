import ko from 'knockout';
import $ from 'jquery';

function Model(params){
  const vm = this;
  const tag_srv_host = params.tag_srv_host;
  const el_recommend_srv_host = params.el_recommend_srv_host;
  const user_id = params.user_id;

  vm.params = {
    tag_srv_host,
    user_id,
    el_recommend_srv_host
  };

}

export {Model};