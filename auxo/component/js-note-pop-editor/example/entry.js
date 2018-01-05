import ko from 'knockout';
import $ from 'jquery';
import 'note';
import './css/reset.css';
import '../css/red/style.scss';

window.projectCode = 'ndr';

let note = {
  "id": "12345678-1234-1234-1234-1234567890ab",
  "user_id": 0,
  "content": "直接需求方：指的是提出目标的一方，在需求拟定过程中主要提出要实现的什么目标，是需求的主导方。直接需求方：指的是提出目标的一方，在需求拟定过程中主要提出要实现的什么目标，是需求的主导方。直接需求方：指的是提出目标的一方，在需求拟定过程中主要提出要实现的什么目标，是需求的主导方。直接需求方：指的是提出目标的一方，在需求拟定过程中主要提出要实现的什么目标，是需求的主导方。直接需求方：指的是提出目标的一方，在需求拟定过程中主要提出要实现的什么目标，是需求的主导方。",
  "target_id": "123",
  "target_name": "目标名称",
  "is_open": true,
  "praise_count": 0,
  "report_count": 20,
  "excerpt_note_id": "12345678-1234-1234-1234-1234567890ab",
  "biz_data":{
    "course_name": "test11113你好",
    "chapter_name": {
      "name": "video",
      "child": null
    },
    "knowledge_name": null,
    "resource_id": "d86f13cb-c581-48a7-b3cd-80518726f494",
    "resource_type": "0",
    "location": {
      "location": "01:01:40",
      "web_link": "http://webfront-course.dev.web.nd/auto_xaqmzsxxw_161228172754/course/d86f13cb-c581-48a7-b3cd-80518726f494/learn?resource_uuid=d86f13cb-c581-48a7-b3cd-80518726f494&resource_type=0#/d86f13cb-c581-48a7-b3cd-80518726f494/0/3700",
      "cmp_link": null
    }
  },
  "create_time": "2015-01-01T00:00:00",
  "update_time": "2015-01-01T00:00:00",
  "project_id": 0,
  "has_excerpted":false, // 是否已摘录
  "has_praised":false, // 是否点赞
  "has_reported":false
};

let opts = {
  apiHost: 'HTTP://elearning-note-api.debug.web.nd',
  onCancelCommand: function(){
    console.log('关闭');
  },
  onSubmitSuccess: function(){
    console.log('提交成功');
  }
};

let model = {note, opts};

ko.applyBindings(model, document.body);

