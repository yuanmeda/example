!function(e){"use strict";function a(e){this.model={data:null,host:""},this.defaultImg=i||"",this.init(e)}function t(e){this.model={data:null,host:""},this.init(e)}function n(e){this.item=e.model,this.hosts=e.host.hosts,this.code=e.host.code,this.openType=e.openType||"_self"}e="default"in e?e.default:e;a.prototype={init:function(e){this.model.data=e.model,this.model.host=e.host},formatDateTime:function(e){var a,t="",n=e.model.data.unit_info.extra,i=e.model.data.extra;return!i||"60"!=this.getExamStatus()&&"70"!=this.getExamStatus()?i&&"50"==this.getExamStatus()?t="":(a=n.begin_time?n.begin_time.split("T"):"",t=n.begin_time?a[0]+" "+a[1].substr(0,5)+'<em class="ml">'+i18nHelper.getKeyValue("collection_exam_unitcard.starting")+"</em>":""):(a=n.end_time?n.end_time.split("T"):"",t=n.end_time?a[0]+" "+a[1].substr(0,5)+'<em class="ml">'+i18nHelper.getKeyValue("collection_exam_unitcard.ending")+"</em>":""),t},formatScore:function(e){return e?parseFloat(e).toFixed(1):0},onClick:function(){var e="";e="3"==this.model.data.unit_info.extra.subtype?this.model.host+"/exam/tounament/prepare/"+this.model.data.unit_id:this.model.host+"/exam/prepare/"+this.model.data.unit_id,window.open(e)},disableBtn:function(){var e=-1,a=this.model.data.extra;switch(this.getExamStatus()){case 70:e=1;break;case 50:case 60:switch(a.last_status){case 16:case 101:e=1;break;case 32:e=a.remain_chance<=0?1:0;break;default:e=0}}return e},userExamStatus:function(e){var a="",t=e.model.data.extra;switch(t.last_status){case 1:a="collection_exam_unitcard.aboutToBegin";break;case 4:a="collection_exam_unitcard.start";break;case 8:case 112:a="collection_exam_unitcard.continueExam";break;case 16:case 101:a="collection_exam_unitcard.waitForCorrect";break;case 32:a=t.remain_chance<=0?"collection_exam_unitcard.noChance":"collection_exam_unitcard.restart";break;case 64:case 80:case 96:a="collection_exam_unitcard.end";break;case 0:a="collection_exam_unitcard.disabled"}return a},getExamStatus:function(){switch(this.model.data.extra.last_status){case 4:case 8:case 112:return 50;case 16:case 101:case 32:return 60;case 0:case 64:case 80:case 96:return 70}}},e.components.register("x-collection-examcard",{viewModel:a,template:'<div class="exam-item" data-bind="click: onClick">\r\n  <div class="item-img">\r\n    <img data-bind="attr: { \'data-original\': model.data.unit_info.cover_url ,src:defaultImg}" class="lazy-image" style="display: inline;">\r\n    <span class="item-ldt" data-bind="translate: { key: \'collection_exam_unitcard.score\', properties: { userScore: model.data.extra?model.data.extra.best_scores:0, totalScore: model.data.unit_info.extra.total_score } }"></span>\r\n  </div>\r\n  <div class="item-info">\r\n    <div class="item-name ellipsis" data-bind="text: model.data.unit_info.title, attr: { title: model.data.unit_info.title }"></div>\r\n    <div class="item-icon mtb15 ellipsis fs13">\r\n      \x3c!--ko if: model.data.extra&&getExamStatus() !== \'70\'--\x3e\r\n        \x3c!--ko if: model.data.extra.remain_chance <= 1000--\x3e\r\n        <span class="v-line">\r\n              \x3c!--ko translate:{ key: \'collection_exam_unitcard.examTimes\' }--\x3e\x3c!--/ko--\x3e\r\n              <i data-bind="text: model.data.extra.remain_chance"></i>\r\n              <em></em>\r\n            </span>\r\n        \x3c!--/ko--\x3e\r\n        \x3c!--ko if: model.data.extra.remain_chance > 1000--\x3e\r\n        <span class="v-line">\r\n              \x3c!--ko translate:{ key: \'collection_exam_unitcard.examTimes\' }--\x3e\x3c!--/ko--\x3e\r\n              <i data-bind="translate:{ key: \'collection_exam_unitcard.noLimit\' }"></i>\r\n              <em></em>\r\n            </span>\r\n        \x3c!--/ko--\x3e\r\n        \x3c!--ko if: model.data.unit_info.extra.duration&&getExamStatus() !== \'70\'--\x3e\r\n        <span class="v-line">\r\n          \x3c!--ko translate:{ key: \'collection_exam_unitcard.duration\' }--\x3e\x3c!--/ko--\x3e\r\n          <i data-bind="text: Math.floor(model.data.unit_info.extra.duration / 60)"></i>\r\n          <em></em>\r\n        </span>\r\n        \x3c!--/ko--\x3e\r\n      \x3c!--/ko--\x3e\r\n    </div>\r\n    <div class="item-label-box ellipsis">\r\n      <span class="item-view" data-bind="html: formatDateTime($data)">\r\n      </span>\r\n      \x3c!--ko if: model.data.extra--\x3e\r\n        <a class="btn fr" href="javascript:;" data-bind="css: { \'btn-disable\': disableBtn() }, translate: { key:userExamStatus($data) }"></a>\r\n        \x3c!--ko if: model.data.extra&&model.data.extra.pass_status== -1--\x3e\r\n        <i style="top:-60px;" class="status-icon spec-icon-ring-verse failed" data-bind="translate: { key: \'collection_exam_unitcard.failed\', target: [\'data-flag\'] }"></i>\r\n        \x3c!--/ko--\x3e\r\n        \x3c!--ko if: model.data.extra&&model.data.extra.pass_status == 0--\x3e\r\n        <i style="top:-60px;" class="status-icon spec-icon-ring-verse ended" data-bind="translate: { key: \'collection_exam_unitcard.waitForMark\', target: [\'data-flag\'] }"></i>\r\n        \x3c!--/ko--\x3e\r\n        \x3c!--ko if:model.data.extra&&model.data.extra.pass_status == 1--\x3e\r\n        <i style="top:-60px;" class="status-icon spec-icon-ring-verse passed" data-bind="translate: { key: \'collection_exam_unitcard.passed\', target: [\'data-flag\'] }"></i>\r\n        \x3c!--/ko--\x3e\r\n      \x3c!--/ko--\x3e\r\n    </div>\r\n  </div>\r\n  <i class="item-label" data-bind="translate:{key:\'collection_exam_unitcard.exam\'}"></i>\r\n</div>'});var i="data:image/png;base64,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";t.prototype={init:function(e){this.model.data=e.model,this.model.host=e.host},formatDateTime:function(e){var e=e.model.data.unit_info,a=e.end_time?e.end_time.split("T"):"";return e.end_time?a[0]+" "+a[1].substr(0,5)+'<em class="ml">'+i18nHelper.getKeyValue("exam_mooc_card.ending")+"</em>":""},formatScore:function(e){return e?parseFloat(e).toFixed(1):0},getExamPrepareUrl:function(){return this.model.host+"/examinee/myexam/"+e.unwrap(this.model.data.unit_info.extra.exam_id)},refreshMac:function(a,t){if(t.currentTarget.children&&t.currentTarget.children.length>0){var n=this.model.host+"/examinee/myexam/"+e.unwrap(this.model.data.unit_info.extra.exam_id);$.each(t.currentTarget.children,function(){var e=$(this).attr("href");if(e&&"javascript:void(0)"!=e&&"#"!=e){var a=Nova.getMacToB64(n);a&&$(this).attr("href",n+"?__mac="+a)}})}return!0},disableBtn:function(){var a=-1,t=e.mapping.toJS(this.model.data);switch(t.unit_type){case"mooc-exam":case"mooc-exercise":switch(t.status){case 1:a=0;break;default:a=1}}return a},getExerciseStatusName:function(e){var a="";switch(e.status){case 0:a="exam_mooc_card.aboutToBegin";break;case 1:a="exam_mooc_card.underway";break;case 2:a="exam_mooc_card.end";break;case 3:a="exam_mooc_card.againExercise";break;case 4:a="exam_mooc_card.opportunityRunOutExercise";break;case 5:a="exam_mooc_card.endExercise"}return a},getExamStatusName:function(e){var a="";switch(e.status){case 0:a="exam_mooc_card.aboutToBegin";break;case 1:a="exam_mooc_card.underway";break;case 2:a="exam_mooc_card.end";break;case 3:case 4:a="exam_mooc_card.aboutToBegin";break;case 5:a="exam_mooc_card.again";break;case 6:a="exam_mooc_card.cheat";break;case 7:a="exam_mooc_card.opportunityRunOut";break;case 8:a="exam_mooc_card.end"}return a},userExamStatus:function(a){var t="",n=e.mapping.toJS(a.model.data);switch(n.unit_type){case"mooc-exam":t=this.getExamStatusName(n);break;case"mooc-exercise":t=this.getExerciseStatusName(n)}return t},getExamStatus:function(){switch(e.mapping.toJS(this.model.data.extra).last_status){case 4:case 8:case 112:return 50;case 16:case 101:case 32:return 60;case 0:case 64:case 80:case 96:return 70}},getExamType:function(a){var t="";switch(e.mapping.toJS(a.unit_info.extra).type){case"0":t="培训结业考试";break;case"1":t="职业认证考试";break;case"2":t="期末考试";break;case"4":t="补考";break;case"5":t="重修考试";break;case"6":t="期中考试";break;case"10":t="其它";break;case"12":t="日常测验";break;default:t=""}return t},formatName:function(e){return e||"--"}},e.components.register("x-collection-exam-mooc",{viewModel:t,template:'<div class="exam-item" data-bind="click: onClick">\r\n  <div class="item-img">\r\n    <img data-bind="attr: { \'data-original\': model.data.unit_info.cover_url ,src:defaultImg}" class="lazy-image" style="display: inline;">\r\n    <span class="item-ldt" data-bind="translate: { key: \'collection_exam_mooc_card.score\', properties: { userScore: model.data.extra.best_scores, totalScore: model.data.unit_info.extra.total_score } }"></span>\r\n  </div>\r\n  <div class="item-info">\r\n    <div class="item-name ellipsis" data-bind="text: model.data.unit_info.title, attr: { title: model.data.unit_info.title }"></div>\r\n    <div class="item-icon mtb15 ellipsis fs13">\r\n      \x3c!-- ko if:model.data.unit_type == \'mooc-exam\' --\x3e\r\n      <span class="v-line">\r\n        \x3c!--ko translate:{ key: \'collection_exam_mooc_card.examType\' }--\x3e\x3c!--/ko--\x3e\r\n        <i data-bind="text: text:getExamType(model.data)"></i>\r\n        <em></em>\r\n      </span>\r\n      <span class="v-line">\r\n        \x3c!--ko translate:{ key: \'collection_exam_mooc_card.examRoom\' }--\x3e\x3c!--/ko--\x3e\r\n        <i data-bind="text: text:formatName(model.data.unit_info.extra.room)"></i>\r\n        <em></em>\r\n      </span>\r\n      \x3c!--/ko--\x3e\r\n    </div>\r\n    <div class="item-label-box ellipsis">\r\n      <span class="item-view" data-bind="html: formatDateTime($data)">\r\n      </span>\r\n      <a class="btn fr" href="javascript:;" data-bind="css: { \'btn-disable\': disableBtn() }, translate: { key:userExamStatus($data) }"></a>\r\n      \x3c!--ko if: model.data.extra.pass_status== 2--\x3e\r\n      <i style="top:-60px;" class="status-icon spec-icon-ring-verse failed" data-bind="translate: { key: \'collection_exam_mooc_card.failed\', target: [\'data-flag\'] }"></i>\r\n      \x3c!--/ko--\x3e\r\n      \x3c!--ko if: model.data.extra.pass_status == 0--\x3e\r\n      <i style="top:-60px;" class="status-icon spec-icon-ring-verse ended" data-bind="translate: { key: \'collection_exam_mooc_card.waitForMark\', target: [\'data-flag\'] }"></i>\r\n      \x3c!--/ko--\x3e\r\n      \x3c!--ko if:model.data.extra.pass_status == 1--\x3e\r\n      <i style="top:-60px;" class="status-icon spec-icon-ring-verse passed" data-bind="translate: { key: \'collection_exam_mooc_card.passed\', target: [\'data-flag\'] }"></i>\r\n      \x3c!--/ko--\x3e\r\n    </div>\r\n  </div>\r\n  <i class="item-label" data-bind="translate:{key:\'collection_exam_mooc_card.exam\'}"></i>\r\n</div>'}),n.prototype={_getComponent:function(){var e;switch(this.item.unit_type){case"mooc-exam":case"mooc-exercise":default:e="x-collection-examcard"}return e},_getHost:function(){var e;switch(this.item.unit_type){case"mooc-exam":case"mooc-exercise":e=this.hosts.mystudy_mooc_exam_web_url;break;default:e=this.hosts.web_front_url+"/"+this.code}return e}},e.components.register("x-collection-exam-container",{viewModel:n,template:'<div data-bind="component:{name:_getComponent(),params:{model:item,host:_getHost(),openType:openType}}" style="float: left;"></div>'})}(ko);
