!function(i){"use strict";function t(i){this.model=i.data}i="default"in i?i["default"]:i;t.prototype.formatStatus=function(i){return 0===i?"singleCoin.notUse":"singleCoin.used"},t.prototype.formatTime=function(i){return i.split("T")[0]},i.components.register("x-single-coin",{viewModel:t,template:'<div class="x-single-coin clearfix">\r\n    <div class="coin-item">\r\n        <div class="coin-fl">\r\n            <div class="coin-title"\r\n                 data-bind="attr:{\'title\':model.coin_certificate_vo.name},text:model.coin_certificate_vo.name"></div>\r\n            <div class="coin-time"\r\n                 data-bind="translate:{\'key\':\'singleCoin.availableTime\',properties:{\'startTime\':formatTime(model.coin_certificate_vo.allow_use_start_time),\'endTime\':formatTime(model.coin_certificate_vo.allow_use_end_time)}}"></div>\r\n            <div class="coin-desc"\r\n                 data-bind="attr:{\'title\':model.coin_certificate_vo.limit_object_name},text:model.coin_certificate_vo.limit_object_name"></div>\r\n        </div>\r\n        <div class="coin-rt">\r\n            <div class="coin-rt-wrap">\r\n                <div class="coin-status" data-bind="translate:{\'key\':formatStatus(model.use_status)}"></div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <i class="cc-icon-circle-solid circle-up"></i>\r\n    <i class="cc-icon-circle-solid circle-down"></i>\r\n</div>'})}(ko);