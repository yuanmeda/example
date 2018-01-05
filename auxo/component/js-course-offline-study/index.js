import tpl from './template.html'
import ko from 'knockout'

Date.toJSTime = function (dt) {
    if (dt) return dt.replace(/^(\d{4})\-(\d{2})\-(\d{2})[ |T](\d{2}):(\d{2}):(\d{2})(.*)$/, "$1-$2-$3 $4:$5");
    return dt;
};

Date.toJSTime2 = function (dt) {
    if (dt) return dt.replace(/^(\d{4})\-(\d{2})\-(\d{2})[ |T](\d{2}):(\d{2}):(\d{2})(.*)$/, " $4:$5:$6");
    return dt;
};

Date.toJSTime3 = function (dt, bool) {
    if (dt) {
        dt = !bool ? dt + '00:00:00' : dt + '23:59:59'
        return dt.replace(/^(\d{4})\-(\d{2})\-(\d{2})[ |T](\d{2}):(\d{2}):(\d{2})(.*)$/, "$1-$2-$3 $4:$5:$6");
    }
    return dt;
};

Date.toJSDate = function (dt) {
    if (dt) return dt.replace(/^(\d{4})\-(\d{2})\-(\d{2})[ |T](\d{2}):(\d{2}):(\d{2})(.*)$/, "$1-$2-$3 ");
    return dt;
};

Date.prototype.Format = function(fmt){
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o){
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}

function Model(params) {
  this.model = {
    "data": null,
    "host": ""
  }
  this.init(params);
}

Model.prototype = {
  init: function (params) {
    this.model.data = params.model;
    this.model.host = params.host;
    this.model.openType = params.openType;
  },
  onBtnClick: function (m, e) {
    if (this.model.data.extra.last_study_course_id) {
      var url =  ko.unwrap(this.model.host) + "/course/" + ko.unwrap(this.model.data.extra.last_study_course_id) +
        "/learn?resource_uuid=" + ko.unwrap(this.model.data.extra.last_study_resource_id) +
        "&resource_type=" + ko.unwrap(this.model.data.extra.last_study_resource_type);
      
      this.navigateTo(url);

      e.stopPropagation();
    } else {
      this.onClick(m, e);
    }

  },
  onClick: function (m, e) {
    var url = ko.unwrap(this.model.host) + "/course/" + ko.unwrap(this.model.data.unit_id);
    this.navigateTo(url);
    e.stopPropagation();
  },
  navigateTo: function (url) {
    switch (this.model.openType) {
      case "_blank":
        window.open(url);
        break;
      default:
        window.top.location.href = url;
        break;
    }
  }
}

ko.components.register("x-offline-coursecard", {
  viewModel: Model,
  template: tpl
})