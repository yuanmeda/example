!function(t){"use strict";function a(t){this.model={data:null,host:""},this.init(t)}t="default"in t?t.default:t,a.prototype={init:function(t){this.model.data=t.model,this.model.host=t.host},onBtnClick:function(a,e){window.location.href=t.unwrap(this.model.data.host)+"/course/"+t.unwrap(this.model.data.extra.last_study_course_id)+"/"+t.unwrap(this.model.data.extra.last_study_resource_id)+"/learn?resource_uuid="+t.unwrap(this.model.data.extra.last_study_resource_id)+"&resource_type="+t.unwrap(this.model.data.extra.last_study_resource_type),e.stopPropagation()},onClick:function(a,e){window.location.href=t.unwrap(this.model.data.host)+"/course/"+this.model.data.unit_id(),e.stopPropagation()}},t.components.register("x-opencoursecard",{viewModel:a,template:'<div class="item" data-bind="click: onClick">                <div class="item-img">                  <img data-bind="attr: { src: model.data.unit_info.cover_url() }" class="lazy-image loaded" style="display: inline;">                  <span class="item-ldt" data-bind="translate: { key: \'open_course_unit.learned\', properties: { userHour: model.data.had_period, totalHour: model.data.unit_info.extra.period } },visible:status!==2"></span>                </div>                <div class="item-info">                  <div class="study-process">                    <span class="inner" data-bind="style: { width: ko.unwrap(model.data.progress) + \'%\'}"></span>                  </div>                  <div class="item-name ellipsis" data-bind="text: model.data.unit_info.title, attr: { title: model.data.unit_info.title }"></div>                  <div class="item-icon mtb15 ellipsis fs13">                    <span class="v-line">                      <i data-bind="text: 1"></i>                      <!--ko translate:{ key: \'open_course_unit.course\' }--><!--/ko-->                      <em></em>                    </span>                    <span class="v-line">                      <i data-bind="text: model.data.unit_info.extra.period"></i>                      <!--ko translate:{ key: \'open_course_unit.period\' }--><!--/ko-->                      <em></em>                    </span>                    <span class="v-line">                      <i data-bind="text: ko.unwrap(model.data.unit_info.extra.exercise_count) + ko.unwrap(model.data.unit_info.extra.exam_count)"></i>                      <!--ko translate:{ key: \'open_course_unit.exam\' }--><!--/ko-->                      <em></em>                    </span>                  </div>                  <div class="item-label-box ellipsis">                    <span class="item-view" data-bind="if: model.data.end_time() != \'\'">                      <!--ko translate:{ key: \'open_course_unit.endTime\' }--><!--/ko-->                      <i class="date" data-bind="text: model.data.end_time().slice(0, 10)"></i>                    </span>                    <a class="btn-default fr" href="javascript:;" data-bind="visible: model.data.status() == 1, click: onBtnClick, translate: { key: \'open_course_unit.continue_studying\' }"></a>                    <a class="btn-disable fr" href="javascript:;" data-bind="visible: model.data.extra.pass_status() == 0, click: onBtnClick, translate: { key: \'open_course_unit.pending\' }"></a>                    <i class="status-icon tuc-icon-ring-verse finished" data-bind="visible: model.data.status() == 2, translate: { key: \'open_course_unit.finished\', target: [\'data-flag\'] }"></i>                  </div>                </div>                <i class="item-label" data-bind="translate: { key: \'open_course_unit.open_course\' }"></i>              </div>'})}(ko);