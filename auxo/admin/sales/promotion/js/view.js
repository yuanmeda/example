$(function(){
  var vm = {};
  var project_code = window.project_code;
  var sales_id = window.sales_id;
  var e_sales_srv_host = window.e_sales_srv_host;
  var e_sales_gw_host = window.e_sales_gw_host;
  var cs_cdn_host = window.cs_cdn_host;
  var promotion_types = [['限时抢购', '限时打折'], ['满减优惠', '满折优惠']];
  var store = {
    get_sales: function(){
      return $.ajax({
        url: e_sales_srv_host + '/v1/sales/' + sales_id
      });
    }
  };

  vm.name = ko.observable();
  vm.start_time = ko.observable();
  vm.end_time = ko.observable();
  vm.banner_url = ko.observable();
  vm.remark = ko.observable();
  vm.promotion_groups = ko.observableArray();
  vm.edit_url = e_sales_gw_host + '/' + project_code + '/admin/promotion/detail/editor?sales_id='+sales_id;

  get_sales();

  function get_sales(){
    store.get_sales()
      .then(function(res){
        vm.name(res.name);
        vm.start_time(timeZoneTrans(res.start_time));
        vm.end_time(timeZoneTrans(res.end_time));
        vm.remark(res.remark);
        get_pic_url(res.banner_pic_id);
        set_groups(res.sales_promotion_groups);
      });
  }

  function get_pic_url(pic_id){
    if(pic_id){
      vm.banner_url(cs_cdn_host + '/v0.1/download?dentryId='+pic_id);
    }
  }

  function set_groups(groups){
    var list = [];
    $.each(groups, function(i, group){
      list.push({
        type: promotion_types[group.sales_type-1][group.sales_sub_type-1],
        count: group.goods_promotion_count
      });
    });
    vm.promotion_groups(list);
  }

  ko.applyBindings(vm, document.body);
});