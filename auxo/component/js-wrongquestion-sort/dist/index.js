!function(t){"use strict";function r(t){this._checkParams(t),this.callBack=t.callBack}t="default"in t?t["default"]:t;r.prototype={_checkParams:function(r){var a=t.mapping.toJS(r.sort_params());a.length<=0?a=[{sort_property:"update_time",sort_direction:"desc",active:!0},{sort_property:"wrong_times",sort_direction:"desc",active:!1}]:1==a.length&&("update_time"==a[0].sort_property?a.push({sort_property:"wrong_times",sort_direction:"desc",active:!1}):a.unshift({sort_property:"update_time",sort_direction:"desc",active:!1})),this.sort_params=t.mapping.fromJS(a)},sort:function(t){for(var r=0;r<this.sort_params().length;r++){var a=this.sort_params()[r];a.sort_property()==t?a.active()?a.sort_direction("desc"==a.sort_direction()?"asc":"desc"):a.active(!0):a.active(!1)}this.onBtnClick(1)},onBtnClick:function(r){this.callBack&&this.callBack(r,t.mapping.toJS(this.sort_params))}},t.components.register("x-wrongquestion-sort",{viewModel:r,template:'<div class="btn-rank-list">\r\n    <span>排序:</span>\r\n    <a data-bind="click:$component.sort.bind($component,\'update_time\'),css:{\'active\':sort_params()[0].sort_property()==\'update_time\' && sort_params()[0].active()}"\r\n       href="javascript:;"\r\n       title="最新收录">最新收录\r\n        <i data-bind="css:{\'icon-rank-down\':sort_params()[0].sort_direction()==\'desc\',\r\n        \'icon-rank-up\':sort_params()[0].sort_direction()==\'asc\'}"></i>\r\n    </a>\r\n    <a data-bind="click:$component.sort.bind($component,\'wrong_times\'),css:{\'active\':sort_params()[1].sort_property()==\'wrong_times\' && sort_params()[1].active()}"\r\n       href="javascript:;"\r\n       title="做错次数">做错次数\r\n        <i data-bind="css:{\'icon-rank-down\':sort_params()[1].sort_direction()==\'desc\',\r\n        \'icon-rank-up\':sort_params()[1].sort_direction()==\'asc\'}"></i>\r\n    </a>\r\n</div>\r\n<div class="btn-type-list">\r\n    <a data-bind="click:onBtnClick.bind($component,4)" class="btn" href="javascript:;" title="类似题练习">类似题练习</a>\r\n    <a data-bind="click:onBtnClick.bind($component,8)" class="btn" href="javascript:;" title="错题重练">错题重练</a>\r\n    <a data-bind="click:onBtnClick.bind($component,16)" class="btn btn-tongji" href="javascript:;" title="错题统计">错题统计</a>\r\n</div>'})}(ko);
