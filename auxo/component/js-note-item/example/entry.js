import ko from 'knockout';
import $ from 'jquery';
import 'note';
import './css/reset.css';
import '../css/red/style.scss';

window.projectCode = 'ndr';

let notes = {
  "count": 5,
  "items": [{
    "id": "c2b8262d-c4e9-436d-94f5-3ad2d967762b",
    "user_id": 301850,
    "content": "浮动即可进口量管理科",
    "target_id": "course:54d69de8-d08a-430e-abbc-4447d17b572a",
    "target_name": null,
    "is_open": true,
    "praise_count": 1,
    "report_count": 0,
    "excerpt_note_id": 123123,
    "biz_data": '{"course_name":"test123123iii","chapter_name":null,"knowledge_name":null,"resource_id":"e525b407-a287-43b2-9eac-7dfe9d83bb59","resource_type":"1","location":{"location":"00:11","web_link":"http://webfront-course.dev.web.nd/onetest/course/e525b407-a287-43b2-9eac-7d…ac-7dfe9d83bb59&resource_type=0#/e525b407-a287-43b2-9eac-7dfe9d83bb59/0/11","cmp_link":"cmp://com.nd.sdp.component.elearning-course?courseId=54d69de8-d08a-430e-abbc-4447d17b572a"}}',
    "biz_view": "course_biz_view",
    "create_time": "2017-04-28T13:34:03.000+0800",
    "update_time": "2017-04-28T13:45:03.000+0800",
    "project_id": 1326,
    "has_excerpted": false,
    "has_praised": false,
    "has_reported": false
  }, ]
};

let note = notes.items[0];

let baseOpts = {
  apiHost: 'HTTP://elearning-note-api.debug.web.nd',
  isLogin: true,
  showExcerpt: false,
  showBlowing: false,
  showEdit: false,
  showDel: false,
  onEditCommand: function(note){
    console.log('编辑回调');
  },
  onDelCommand: function(id){
    console.log('删除回调');
  }
};

const opts1 = {};
const opts2 = {};
const opts3 = {};
const opts4 = {};

$.extend(true, opts1, baseOpts, {
  showExcerpt: true,
  showBlowing: true
});

$.extend(true, opts2, baseOpts, {
  showEdit: true,
  showDel: true
});

$.extend(true, opts3, baseOpts, {
  showExcerpt: true,
  showBlowing: true
});


$.extend(true, opts4, baseOpts, {
  showEdit: true,
  showDel: true
});


let model = {note, opts1, opts2, opts3, opts4};

ko.applyBindings(model, document.body);

