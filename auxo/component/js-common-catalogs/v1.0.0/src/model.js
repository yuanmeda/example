import ko from 'knockout';
import $ from 'jquery';

/**
 *
 * @param params
 * {
 *   auxo_channel_api_host,
 *   auxo_tag_api_host,
 *   on_data_received,
 * }
 * @constructor
 */
export default function Model(params){
  const vm = this;
  const auxo_channel_api_host = params.auxo_channel_api_host;
  const auxo_tag_api_host = params.auxo_tag_api_host;
  const on_data_received = params.on_data_received || function(){};

  const store = {
    get_channels(){
      return $.ajax({
        url: `${auxo_channel_api_host}/v1/channels/search`
      });
    },
    get_tags_tree(custom_id){
      return $.ajax({
        url: `${auxo_tag_api_host}/v2/tags/tree`,
        data:{
          custom_type: 'el-channel',
          custom_id
        }
      })
    }
  };
  
  vm.channels = ko.observableArray([]);
  vm.tags_tree = ko.observable([]);
  vm.curr_channel = ko.observable(null);
  vm.selected_tags = ko.observableArray([]);
  vm.tag_rows = ko.observable({});

  vm.select_channel = select_channel;
  vm.select_tag = select_tag;
  vm.select_curr_all = select_curr_all;
  vm.select_all_channel = select_all_channel;

  store.get_channels()
    .pipe(res=>{
      vm.curr_channel(res.items[0]);
      vm.channels(res.items);
    })
    .pipe(()=>{
      select_all_channel();
    });

  function select_channel(channel){
    vm.curr_channel(channel);
    return get_tags_tree(channel);
  }
  
  function select_tag(parent, child){
    const tag_rows = vm.tag_rows();
    tag_rows[parent.id] = child.id;
    const list = [];
    $.each(tag_rows, (key, val)=>{
      list.push(val);
    });
    vm.tag_rows(tag_rows);
    vm.selected_tags(list);
    send_info();
  }
  
  function select_curr_all(parent){
    const tag_rows = vm.tag_rows();
    delete tag_rows[parent.id];
    const list = [];
    $.each(tag_rows, (key, val)=>{
      list.push(val);
    });
    vm.tag_rows(tag_rows);
    vm.selected_tags(list);
    send_info();
  }

  function get_tags_tree(channel){
    return store.get_tags_tree(channel.id)
      .then(res=>{
        const tags_tree = get_flatten_tags(res.children);
        vm.tags_tree(tags_tree);
        // 重置选取的标签
        reset_tags();
        send_info();
      });
  }

  function get_flatten_tags(tags){
    const root = [];
    $.each(tags, (i, tag)=>{
      root[i] = {
        id: tag.id,
        title: tag.title,
        children:[]
      };
      flat_assist(root[i].children, tag);
    });
    return root;
  }

  function flat_assist(list, tag){
    if(tag.children && tag.children.length>0){
      $.each(tag.children, (i, child)=>{
        list.push({
          title:child.title,
          id: child.id
        });
        flat_assist(list, child);
      });
    }
  }

  /*清理标签数组*/
  function clean(array) {
    for (let i = 0; i <array.length; i++) {
      if (array[i].children.length === 0) {
        array.splice(i, 1);
        i--;
      }
    }
  }

  function select_all_channel(){
    vm.curr_channel(null);
    vm.tags_tree([]);
    reset_tags();
    send_info();
  }

  function reset_tags(){
    vm.tag_rows({});
    vm.selected_tags([]);
  }

  function send_info(){
    on_data_received(vm.curr_channel(), vm.selected_tags());
  }
}