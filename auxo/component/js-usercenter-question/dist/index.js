!function(e){"use strict";function t(t){var a=[{type:2,title:n("ucQa.all"),is_accepted:undefined},{type:2,title:n("ucQa.unanswered"),is_accepted:!1},{type:2,title:n("ucQa.answered"),is_accepted:!0}];this.model={tab:e.observable(0),select:{custom_id:e.observable(""),name:e.observable(n("ucQa.all"))},query_type:e.observableArray(a),question:{title:e.observable(""),content:e.observable(""),attach_pictures:e.observableArray([]),placeholder:n("ucQa.ph4"),isEdit:e.observable(!1),isSearchRelateQ:e.observable(!1),info:{id:e.observable(""),create_user:e.observable(""),create_time:e.observable(""),display_user:{display_name:e.observable(""),icon:e.observable("")},title:e.observable(""),content:e.observable(""),target_name:e.observable(""),follow_count:e.observable(0),attach_pictures:e.observableArray([])},items:e.observableArray([]),counts:e.observable(0),relateQ:e.observableArray([]),search:{page_no:e.observable(0),page_size:e.observable(10),custom_id:e.observable(""),type:e.observable(2),content:e.observable(""),is_accepted:e.observable("")}},course:{init:e.observable(!1),items:e.observableArray([{custom_id:"",name:n("ucQa.all")}]),counts:e.observable(0),search:{page_size:10,page_no:e.observable(0)}},answer:{content:e.observable(""),attach_pictures:e.observableArray([]),placeholder:n("ucQa.ph3"),search:{question_id:e.observable(""),page_size:10,page_no:e.observable(0)}},api:{mystudy:t.mystudy_gateway,qa_gateway:t.qa_gateway,qa_api:t.qa_api},user:{id:e.observable(t.user_id),photo:t.user_photo},history:{tab:e.observable(0)},init:e.observable(!1),showUpload:e.observable(!1)},this.init(),this.bindEvent(),this.validate(),this.validInfo=e.validatedObservable(this.model,{deep:!0})}e=e&&"default"in e?e["default"]:e;var n=i18nHelper.getKeyValue;t.prototype.store={getCourses:function(e,t){return $.ajax({url:e+"/v1/mine/studies/business_courses",data:t,dataType:"json",cache:!1})},getQuestions:function(e,t){return $.ajax({url:e+"/v1/questions/search",data:t,dataType:"json",cache:!1})},getAnswers:function(e,t){return $.ajax({url:e+"/v1/answers/mine",data:t,dataType:"json",cache:!1})},getAnswersById:function(e,t){return $.ajax({url:e+"/v1/answers/search",data:t,dataType:"json",cache:!1})},createQuestion:function(e,t){return $.ajax({url:e+"/v1/questions",contentType:"application/json;charset=utf-8",data:JSON.stringify(t),type:"POST",dataType:"json"})},createAnswer:function(e,t){return $.ajax({url:e+"/v1/answers",contentType:"application/json;charset=utf-8",data:JSON.stringify(t),type:"POST",dataType:"json"})},editQuestion:function(e,t,n){return $.ajax({url:e+"/v1/questions/"+t,contentType:"application/json;charset=utf-8",data:JSON.stringify(n),type:"put",dataType:"json"})},getMyInterest:function(e,t){return $.ajax({url:e+"/v1/questions/mine/follows",data:t,dataType:"json",cache:!1})},getQuestionbyId:function(e,t){return $.ajax({url:e+"/v1/questions/"+t,dataType:"json",cache:!1})}},t.prototype.init=function(){"undefined"!=typeof __mode&&-1!=__mode?(this.model.init(!0),this.switchQTab(__mode),this.getCourses(),$(".uc-qa-body-nav").remove()):(this.getCourses(),this.getList()),this.getR=this.throttle($.proxy(this.getRelatQ,this),500);var e=this;this.model.question.title.subscribe(function(t){""!==$.trim(t)&&e.model.question.isSearchRelateQ()?e.getR():e.model.question.relateQ.removeAll()})},t.prototype.getRelatQ=function(){var t=this.model.question;t.search.content(t.title()),t.search.type(5),""!=$.trim(t.title())&&this.store.getQuestions(this.model.api.qa_gateway,e.mapping.toJS(t.search)).done(function(e){t.relateQ(e.items||[])})},t.prototype.getCourses=function(){var t=this.model.course;this.store.getCourses(this.model.api.mystudy,e.mapping.toJS(t.search)).done(function(e){Array.prototype.push.apply(t.items(),e.items),t.items.valueHasMutated(),t.counts(e.count),t.init(!0)})},t.prototype.selectCourse=function(e){var t=this.model;t.select.custom_id(e.custom_id),t.select.name(e.name),this.switchQTab(this.model.tab())},t.prototype.switchQTab=function(e,t){if(~$.inArray(this.model.tab(),[0,1,2,6])){if(!this.model.init())return;this.model.history.tab(this.model.tab())}this.model.question.items([]),this.model.question.counts(0),this.formatParams(e,t),this.model.question.search.page_no(0),this.model.tab(e),this.getList()},t.prototype.formatParams=function(e,t){var a=[];switch(e){case 0:a=[{type:2,title:n("ucQa.all"),is_accepted:undefined},{type:2,title:n("ucQa.unanswered"),is_accepted:!1},{type:2,title:n("ucQa.answered"),is_accepted:!0}],this.model.question.search.content(""),this.model.question.search.is_accepted(undefined),this.model.question.search.type(2);break;case 1:a=[{title:n("ucQa.all"),is_accepted:undefined},{title:n("ucQa.accepted"),is_accepted:!0}],this.model.question.search.content(""),this.model.question.search.is_accepted(undefined);break;case 2:a=[{type:5,title:n("ucQa.hot")},{type:3,title:n("ucQa.new")}],this.model.question.search.is_accepted(undefined),this.model.question.search.content(""),this.model.question.search.type(5);break;case 3:this.model.answer.content(""),this.model.answer.attach_pictures([]),this.model.question.info.id(t),this.validInfo.errors.showAllMessages(!1),this.model.showUpload(!1);break;case 4:this.model.question.isEdit(!!t),this.model.question.info.id(t?t.id:""),this.model.question.relateQ([]),this.model.showUpload(!1),this.model.question.isSearchRelateQ(!1);break;case 5:this.model.question.search.type(1);break;case 6:a=[{type:2,title:n("ucQa.all"),is_accepted:undefined},{type:2,title:n("ucQa.unanswered"),is_accepted:!1},{type:2,title:n("ucQa.answered"),is_accepted:!0}],this.model.question.search.is_accepted(undefined),this.model.question.search.content("")}this.model.query_type(a)},t.prototype.getList=function(t){var n=this.model,a=this,o=n.question,s=n.api.qa_gateway;switch(n.init(!1),o.search.custom_id(n.select.custom_id()),o.search.content($.trim(o.search.content())),o.items([]),o.counts(0),n.tab()){case 0:case 2:case 5:this.store.getQuestions(s,e.mapping.toJS(o.search)).done(function(e){a.handleData(e)});break;case 1:var i=e.mapping.toJS(o.search);i.type=undefined,this.store.getAnswers(s,i).done(function(e){a.handleData(e),$(".uc-qa-body-content-answer-ques p").dotdotdot({height:50})});break;case 3:n.answer.search.question_id(o.info.id()),$.extend(n.answer.search,n.question.search),t||this.store.getQuestionbyId(s,o.info.id()).done(function(t){e.mapping.fromJS(t,{},o.info)}),this.store.getAnswersById(s,e.mapping.toJS(n.answer.search)).done(function(e){a.handleData(e)});break;case 4:o.isEdit()?this.store.getQuestionbyId(s,o.info.id()).done(function(e){o.title(e.title),o.content(e.content),o.attach_pictures(e.attach_pictures||[])}):(o.title(""),o.content(""),o.attach_pictures([]),this.validInfo.errors.showAllMessages(!1));break;case 6:this.store.getMyInterest(s,e.mapping.toJS(o.search)).done(function(e){a.handleData(e)})}},t.prototype.handleData=function(e){var t=this.model;this.model.course;t.init(!0),t.question.items(e.items||[]),t.question.counts(e.total||0),this._page(t.question.counts(),t.question.search.page_no(),t.question.search.page_size())},t.prototype.bindEvent=function(){$(document).unbind("click"),$(document).on("click",function(e){$(e.target).hasClass("uc-qa-header-select-item")||$(e.target).parent(".uc-qa-header-select-item").length?$("#js_qa_slist").toggle():$("#js_qa_slist").hide(),$("#js_relateq_list").hide()})},t.prototype.queryByType=function(e,t){$(t.target).addClass("on").siblings().removeClass("on"),this.model.question.search.type(e.type),this.model.question.search.is_accepted(e.is_accepted),this.getList()},t.prototype.goBack=function(){this.model.question.search.content(""),this.switchQTab(this.model.history.tab())},t.prototype.createQuestion=function(){if(this.validInfo.isValid()){var e=this,t=$.trim(this.model.question.title()),n=$.trim(this.model.question.content()),a=this.model.api.qa_gateway;this.model.question.isEdit()?this.store.editQuestion(a,this.model.question.info.id(),{title:t,content:n,attach_pictures:this.model.question.attach_pictures()}).done(function(){e.success()}):this.store.createQuestion(a,{title:t,content:n,attach_pictures:this.model.question.attach_pictures()}).done(function(t){e.success()})}else this.validInfo.errors.showAllMessages()},t.prototype.success=function(){var e=this;$.fn.udialog.alert(n("ucQa.success"),{buttons:[{text:n("ucQa.ok"),click:function(){$(this).udialog("hide")},"class":"default-btn"}]}),setTimeout(function(){$(".ui-dialog").remove(),e.switchQTab(0)},1500)},t.prototype.createAnswer=function(){if(this.validInfo.isValid()){var e={question_id:this.model.question.info.id(),attach_pictures:this.model.answer.attach_pictures(),content:$.trim(this.model.answer.content())},t=this;this.store.createAnswer(this.model.api.qa_gateway,e).done(function(){t.model.answer.content(""),t.model.showUpload(!1),t.model.answer.attach_pictures([]),t.validInfo.errors.showAllMessages(!1),t.model.question.search.page_no(0),t.model.question.items([]),t.model.question.counts(0),t.getList()})}else this.validInfo.errors.showAllMessages()},t.prototype.searchRelateQ=function(e,t){return this.model.question.isSearchRelateQ(!0),this.toggleActive(e,t),!0},t.prototype.scroll=function(){var e=this.model.course;e.init()&&e.counts()>10&&e.items().length-1<e.counts()&&$("#js_qa_slist").children("li").eq(-5).offset().top<350&&(e.init(!1),e.search.page_no(e.search.page_no()+1),this.getCourses())},t.prototype.validate=function(){var e=this;this.model.question.title.extend({required:{params:!0,message:n("ucQa.required"),onlyIf:function(){return 4===e.model.tab()}}}),this.model.question.content.extend({maxLength:{params:2e3,message:n("ucQa.max1"),onlyIf:function(){return 4===e.model.tab()}}}),this.model.answer.content.extend({required:{params:!0,message:n("ucQa.required"),onlyIf:function(){return 3===e.model.tab()}},maxLength:{params:2e3,message:n("ucQa.max1"),onlyIf:function(){return 3===e.model.tab()}}})},t.prototype.focus=function(e,t){$(t.target).siblings("input,textarea").focus()},t.prototype.toggleActive=function(e,t){return $(t.target).parent().toggleClass("active"),!0},t.prototype.throttle=function(e,t){var n=null;return function(){var a=this,o=arguments;clearTimeout(n),n=setTimeout(function(){e.apply(a,o)},t)}},t.prototype.formatDate=function(e){return e?(e=e.replace("T"," "),e=e.replace(/-/g,"/"),e=e.substring(0,e.indexOf("."))+" "+e.substring(e.indexOf(".")+4)):""},t.prototype.showUpload=function(){this.model.showUpload(!this.model.showUpload())},t.prototype._page=function(e,t,n){var a=this.model.question.search,o=this;$("#js_qa_pagination").pagination(e,{items_per_page:n,num_display_entries:5,current_page:t,is_show_total:!1,is_show_input:!0,pageClass:"pagination-box",prev_text:"common.addins.pagination.prev",next_text:"common.addins.pagination.next",callback:function(e){e!=t&&(a.page_no(e),o.getList(!0))}})},e.components.register("x-usercenter-qa",{viewModel:t,template:'<div class="uc-qa" id="x-usercenter-qa">\r\n    <div class="uc-qa-header clearfix">\r\n        <div data-bind="visible: model.tab() != 4 && model.tab() != 3">\r\n            <form autocomplete="off" class="uc-qa-header-form fr"\r\n                  data-bind="event: {submit: $component.switchQTab.bind($component, 5)}">\r\n                <input maxlength="200" type="text"\r\n                       data-bind="textInput: model.question.search.content, event:{focus: $component.toggleActive, blur: $component.toggleActive}"\r\n                       class="uc-qa-header-form-word">\r\n                <i class="uc-qa-header-form-search usercenter-qa uq-icon-search"\r\n                   data-bind="click: $component.switchQTab.bind($component, 5)"></i>\r\n                <label class="uc-qa-header-form-placeholder"\r\n                       data-bind="click: $component.focus, visible: !model.question.search.content().length, translate: {key: \'ucQa.ph1\'}">搜索问题</label>\r\n            </form>\r\n            <div class="uc-qa-header-select fr">\r\n                <div class="uc-qa-header-select-item">\r\n                    <div class="uc-qa-header-select-item-name" data-bind="text: model.select.name"></div>\r\n                    <i class="uc-qa-header-select-icon usercenter-qa uq-icon-down"></i></div>\r\n                <ul id="js_qa_slist" class="uc-qa-header-select-list" style="display: none;"\r\n                    data-bind="foreach: model.course.items, event:{scroll: $component.throttle.call($component, $component.scroll.bind($component), 500) }">\r\n                    <li data-bind="text: name, attr: { title: name }, css: {\'uc-qa__active\': custom_id == $component.model.select.custom_id()}, click: $component.selectCourse.bind($component)">\r\n                        全部\r\n                    </li>\r\n                </ul>\r\n            </div>\r\n            <a href="javascript:;" class="uc-qa-header-btn fl"\r\n               data-bind="click: $component.switchQTab.bind($component, 4, null)">\r\n                \x3c!-- ko translate: {key: \'ucQa.ask\' }--\x3e我要提问\r\n                \x3c!--/ko--\x3e</a>\r\n        </div>\r\n        <a style="display: none;" href="javascript:;" class="uc-qa-header-back fl"\r\n           data-bind="click: $component.goBack.bind($component), visible: model.tab() == 4 || model.tab() == 3, translate: {key: \'ucQa.back\'}">返回</a>\r\n    </div>\r\n    <div class="uc-qa-body">\r\n        <ul class="uc-qa-body-nav clearfix"\r\n            data-bind="visible: model.tab() != 4 && model.tab() != 3 && model.tab() != 5">\r\n            <li data-bind="click: $component.switchQTab.bind($component, 0), css: {active: !model.tab()},translate: {key: \'ucQa.mineQ\'}">\r\n                我的提问\r\n            </li>\r\n            <li data-bind="click: $component.switchQTab.bind($component, 1), css: {active: model.tab() == 1},translate: {key: \'ucQa.mineA\'}">\r\n                我的回答\r\n            </li>\r\n            <li data-bind="click: $component.switchQTab.bind($component, 6), css: {active: model.tab() == 6},translate: {key: \'ucQa.mineInterest\'}">\r\n                我的关注\r\n            </li>\r\n            <li data-bind="click: $component.switchQTab.bind($component, 2), css: {active: model.tab() == 2},translate: {key: \'ucQa.allQ\'}">\r\n                全部问题\r\n            </li>\r\n        </ul>\r\n        <div class="uc-qa-body-searchbar clearfix" data-bind="visible: model.tab() === 5">\r\n            <span class="fl"\r\n                  data-bind="translate: {key: \'ucQa.result\', properties:{total: $component.model.question.counts()}}"></span>\r\n            <a href="javascript:;" class="uc-qa-header-back fr"\r\n               data-bind="click: $component.goBack.bind($component), translate: {key:\'ucQa.back\'}">返回</a>\r\n        </div>\r\n        <div class="uc-qa-body-content">\r\n            <div data-bind="visible: model.tab() != 4 && model.tab() != 3 && model.tab() != 5, foreach: model.query_type" class="usercenter-tab">\r\n                <a data-bind="text: title, css: {\'on\': !$index() }, click: $component.queryByType.bind($component)" href="javascript:;" ></a>\r\n            </div>\r\n            \x3c!-- 问题详情--\x3e\r\n            <div data-bind="visible: model.tab() == 3 && model.init() , with: model.question.info">\r\n                <div class="uc-qa-body-content-question clearfix">\r\n                    <div class="uc-qa-body-content-answer-img fl">\r\n                        <img data-bind="attr:{src: display_user.icon() + \'&defaultImage=1\'}">\r\n                    </div>\r\n                    <div class="uc-qa-body-content-answer-cont fl">\r\n                        <h5 class="uc-qa-body-content-question-title" data-bind="text: title"></h5>\r\n                        <p class="uc-qa-body-content-question-description" data-bind="text: content"></p>\r\n                        \x3c!--ko component:{name:\'x-qas-image-preview\', params:{images: ko.toJS(attach_pictures) }}--\x3e\r\n                        \x3c!--/ko--\x3e\r\n                        <div class="uc-qa-body-content-question-info">\r\n                            <span data-bind="text: display_user.display_name"></span>\r\n                            <span data-bind="text: $.format.toBrowserTimeZone($component.formatDate(create_time()), \'yyyy-MM-dd HH:mm\')"></span>\r\n                            <span data-bind="visible: target_name, translate: {key: \'ucQa.from\', properties:{course: target_name()}}"></span>\r\n                        </div>\r\n                        <div class="uc-qa-body-content-question-focus">\r\n                            <span class="uc-qa-body-content-question-focus-num"\r\n                                  data-bind="translate: {key: \'ucQa.fellow\', properties:{total: follow_count || 0 }}">2</span>\r\n                        </div>\r\n                        <div class="uc-qa-body-content-question-wrap"\r\n                             data-bind="visible: $component.model.user.id() != create_user()" style="display:none;">\r\n                            <form class="uc-qa-body-content-question-form"\r\n                                  data-bind="event: {submint: $component.createAnswer.bind($component)}">\r\n                                <textarea maxlength="2000" class="uc-qa-body-content-question-form-answer"\r\n                                          data-bind="textInput: $component.model.answer.content, event:{focus: $component.toggleActive, blur: $component.toggleActive}"></textarea>\r\n                                <label class="uc-qa-header-form-placeholder"\r\n                                       data-bind="visible: !$component.model.answer.content().length, click: $component.focus.bind($component), translate:{key:\'ucQa.ph3\'}">写下你的回答</label>\r\n                            </form>\r\n                            <a href="javascript:;" class="uc-qa-body-content-picture fl"\r\n                               data-bind="click: $component.showUpload.bind($component)"><i\r\n                                        class="usercenter-qa uq-icon-picture uc-qa-icon"></i><span\r\n                                        data-bind="translate: {key: \'ucQa.image\'}">图片</span></a>\r\n                            <a href="javascript:;" class="fr uc-qa-body-content-question-form-btn"\r\n                               data-bind="click: $component.createAnswer.bind($component), translate:{key:\'ucQa.answer\'}">回答</a>\r\n                            <span class="uc-qa-body-content-ask-label-limit fr" style="margin: 15px 5px 0 0;"><em\r\n                                        data-bind="text: $component.model.answer.content().length"></em>/2000</span>\r\n                            <div class="uc-qa-body-content-upimg"\r\n                                 data-bind="visible:$component.model.tab()===3"\r\n                                 style="left: 0;bottom: -200px;">\r\n                                \x3c!-- ko if: $component.model.showUpload() && $component.model.tab()===3  --\x3e\r\n                                \x3c!--ko component:{name:\'x-question-uploadimg\', params:{attach_pictures: $component.model.answer.attach_pictures, api_url: $component.model.api.qa_api, is_show: $component.model.showUpload} }--\x3e\r\n                                \x3c!--/ko--\x3e\r\n                                \x3c!--/ko--\x3e\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n                <div class="uc-qa-body-content-question-total"\r\n                     data-bind="translate: {key: \'ucQa.total\', properties:{total:$component.model.question.counts }}"></div>\r\n            </div>\r\n            \x3c!-- 问题列表 --\x3e\r\n            <div class="uc-qa-body-content-list" data-bind="visible: model.tab() !== 4">\r\n                \x3c!-- 我的回答 --\x3e\r\n                \x3c!-- ko if: model.tab() === 1&&model.question.items().length && model.init() --\x3e\r\n                <div data-bind="foreach: model.question.items">\r\n                    <div class="uc-qa-body-content-answer clearfix">\r\n                        <div class="uc-qa-body-content-answer-img fl">\r\n                            <img data-bind="attr: {src: $component.model.user.photo}">\r\n                        </div>\r\n                        <div class="uc-qa-body-content-answer-cont fl">\r\n                            <p class="uc-qa-body-content-answer-title" data-bind="text: content"></p>\r\n                            <a href="javascript:;" class="uc-qa-body-content-answer-ques"\r\n                               data-bind="click: $component.switchQTab.bind($component, 3, question_vo.id)">\r\n                                <p data-bind="text: question_vo ? question_vo.title : \'\'"></p>\r\n                                <span data-bind="translate:{key: \'ucQa.question\', properties:{name: question_vo.display_user.display_name}}">提问者：张珊</span>\r\n                                <span data-bind="text: $.format.toBrowserTimeZone($component.formatDate(question_vo.create_time), \'yyyy-MM-dd HH:mm\')">2013-11-05  10:23</span>\r\n                                <span data-bind="visible:question_vo.target_name ,translate:{key: \'ucQa.from\', properties:{course: question_vo.target_name}}">来自：此处显示课件名称</span>\r\n                                <i class="uc-qa-body-content-answer-triangle"></i>\r\n                            </a>\r\n                            <div class="uc-qa-body-content-answer-info">\r\n                                <span class="uc-qa-body-content-answer-info-time"\r\n                                      data-bind="text: $.format.toBrowserTimeZone($component.formatDate(create_time), \'yyyy-MM-dd HH:mm\')">2013-11-05  10:23</span>\r\n                                <a class="uc-qa-body-content-answer-info-like"><i\r\n                                            class="usercenter-qa uq-icon-like"></i><span\r\n                                            data-bind="text: like_count"></span></a>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n                \x3c!-- /ko --\x3e\r\n                \x3c!-- ko if: model.tab() != 1 && model.tab() != 3 && model.question.items().length && model.init() --\x3e\r\n                \x3c!-- ko foreach: model.question.items --\x3e\r\n                \x3c!--ko component:{name:\'x-qas-question\', params:{question: $data, options:{keyword: $component.model.question.search.content,on_del_command: $component.getList.bind($component), on_edit_command: $component.switchQTab.bind($component, 4, $data), on_title_command: $component.switchQTab.bind($component, 3, id) , curr_user_id: $component.model.user.id(), gw_host: $component.model.api.qa_gateway , api_host: $component.model.api.qa_api } } }--\x3e\r\n                \x3c!--/ko--\x3e\r\n                \x3c!--/ko--\x3e\r\n                \x3c!--/ko--\x3e\r\n                \x3c!-- 问题详情/回答列表 --\x3e\r\n                \x3c!-- ko if: model.tab() == 3 && model.question.items().length && model.init() --\x3e\r\n                \x3c!-- ko foreach: model.question.items --\x3e\r\n                \x3c!--ko component:{name:\'x-qas-answer\', params:{answer: $data, options:{on_del_command: $component.getList.bind($component), curr_user_id: $component.model.user.id(), question: $component.model.question.info, gw_host: $component.model.api.qa_gateway , api_host: $component.model.api.qa_api, show_images: true } } }--\x3e\r\n                \x3c!--/ko--\x3e\r\n                \x3c!--/ko--\x3e\r\n                \x3c!--/ko--\x3e\r\n                <div class="uc-qa-body-content-nodata" data-bind="visible: !model.question.items().length">\r\n                    <i data-bind="visible: model.init" class="ms-icon-question-empty"></i>\r\n                    <p data-bind="visible: model.init, translate:{key: \'ucQa.nodata\'}">暂无问题</p>\r\n                    <p data-bind="visible: !model.init(), translate:{key: \'ucQa.loading\'}">数据加载中...</p>\r\n                </div>\r\n                <div id="js_qa_pagination" data-bind="visible: model.question.items().length && model.init()"\r\n                     class="cf pagination-box"></div>\r\n            </div>\r\n            \x3c!-- 编辑问题--\x3e\r\n            <div class="uc-qa-body-content-ask" data-bind="visible: model.tab() == 4">\r\n                <form autocomplete="off" class="uc-qa-body-content-ask-form"\r\n                      data-bind="event: {submit: createQuestion}">\r\n                    <div class="uc-qa-body-content-ask-label clearfix">\r\n                        <span class="uc-qa-body-content-ask-label-title fl" data-bind="translate:{key: \'ucQa.title\'}">问题：</span>\r\n                        <span class="uc-qa-body-content-ask-label-limit fr"><em\r\n                                    data-bind="text: model.question.title().length"></em>/50</span>\r\n                    </div>\r\n                    <div class="uc-qa-body-content-ask-form-input-wrap">\r\n                        <input maxlength="50" type="text"\r\n                               data-bind="textInput: model.question.title, event:{focus: $component.searchRelateQ, blur: $component.toggleActive}"\r\n                               class="uc-qa-body-content-ask-form-input">\r\n                        <label class="uc-qa-header-form-placeholder"\r\n                               data-bind="click: $component.focus, visible: !model.question.title().length, translate:{key: \'ucQa.ph2\'}">写下你的问题</label>\r\n                        <ul id="js_relateq_list" class="uc-qa-body-content-ask-form-input-list" style="display: none;"\r\n                            data-bind="visible: model.question.relateQ().length">\r\n                            <li class="uc-qa-body-content-ask-form-input-list-header"\r\n                                data-bind="translate:{key: \'ucQa.relateq\'}"></li>\r\n                            \x3c!--ko foreach: model.question.relateQ --\x3e\r\n                            <li class="uc-qa-body-content-ask-form-input-list-item"\r\n                                data-bind="click: $component.switchQTab.bind($component, 3, id)">\r\n                                <a href="javascript:;" data-bind="text: title"></a><span\r\n                                        data-bind="translate:{key: \'ucQa.answercount\', properties:{total: answer_count || 0}}">4个回答</span>\r\n                            </li>\r\n                            \x3c!--/ko--\x3e\r\n                        </ul>\r\n                    </div>\r\n                    <div class="uc-qa-body-content-ask-label clearfix">\r\n                        <span class="uc-qa-body-content-ask-label-title fl" data-bind="translate:{key: \'ucQa.title1\'}">问题详情（选填）：</span>\r\n                        <span class="uc-qa-body-content-ask-label-limit fr"><em\r\n                                    data-bind="text: model.question.content().length"></em>/2000</span>\r\n                    </div>\r\n                    <div class="uc-qa-body-content-ask-form-textarea-wrap">\r\n                        <textarea maxlength="2000" class="uc-qa-body-content-ask-form-textarea"\r\n                                  data-bind="textInput: model.question.content, event:{focus: $component.toggleActive, blur: $component.toggleActive}"></textarea>\r\n                        <label class="uc-qa-header-form-placeholder"\r\n                               data-bind="click: $component.focus, visible: !model.question.content().length, translate:{key: \'ucQa.ph4\'}">问题详细信息</label>\r\n                    </div>\r\n                </form>\r\n                <a href="javascript:;" class="uc-qa-body-content-picture fl" data-bind="click: showUpload"><i\r\n                            class="usercenter-qa uq-icon-picture uc-qa-icon"></i><span\r\n                            data-bind="translate: {key: \'ucQa.image\'}">图片</span></a>\r\n                <a href="javascript:;" class="uc-qa-body-content-ask-btn fr"\r\n                   data-bind="click: $component.createQuestion, translate:{key: \'ucQa.askfor\'}">马上提问</a>\r\n                <div class="uc-qa-body-content-upimg" data-bind="visible: model.tab() === 4">\r\n                    \x3c!-- ko if: model.showUpload() && model.tab()===4 --\x3e\r\n                    \x3c!--ko component:{name:\'x-question-uploadimg\', params:{attach_pictures: $component.model.question.attach_pictures, api_url: model.api.qa_api, is_show: model.showUpload} }--\x3e\r\n                    \x3c!--/ko--\x3e\r\n                    \x3c!--/ko--\x3e\r\n                </div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>'})}(ko);
