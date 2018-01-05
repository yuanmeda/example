const question_1 = {
  "id": "5bca172f-379f-4b40-bb11-f72bd788bb3a",
  "create_user": 10005074,
  "target_id": null,
  "target_name": null,
  "project_id": 1326,
  "custom_id": null,
  "custom_type": null,
  "context_id": null,
  "type": null,
  "title": "123",
  "content": null,
  "last_answer_time": "2017-05-09T11:42:57.000+0800",
  "answer_count": 0,
  "create_time": "2017-05-09T11:42:57.000+0800",
  "update_time": "2017-05-09T11:42:57.000+0800",
  "display_user": {
    "user_id": 10005074,
    "user_name": "",
    "nick_name": "黄军",
    "nick_name_full": "huangjun",
    "nick_name_short": "hj",
    "create_time": null,
    "org_exinfo": {
      "node_id": 495331463802,
      "node_name": "QA部软件测试处软件测试三组",
      "org_id": 491036501742,
      "org_name": "ND",
      "org_user_code": "10005074",
      "real_name": "黄军",
      "real_name_full": "huangjun",
      "real_name_short": "hj"
    },
    "display_name": "黄军",
    "icon": "http://betacs.101.com/v0.1/static/preproduction_content_cscommon/avatar/10005074/10005074.jpg?size=80"
  },
  "count": 0,
  "is_current_user_answer": false,
  "count_question_by_month": 2,
  "qa_type": null,
  "course_name": null
};
const question_2 = {
  "id": "89585ecb-0298-4d81-8537-54cc230344dc",
  "create_user": 890918,
  "target_id": null,
  "target_name": null,
  "project_id": 1326,
  "custom_id": null,
  "custom_type": null,
  "context_id": null,
  "type": null,
  "title": "test",
  "content": null,
  "last_answer_time": "2017-05-08T19:15:50.000+0800",
  "answer_count": 0,
  "create_time": "2017-05-08T19:15:50.000+0800",
  "update_time": "2017-05-08T19:15:50.000+0800",
  "display_user": {
    "user_id": 890918,
    "user_name": "",
    "nick_name": "粉丝890918",
    "nick_name_full": "fensi890918",
    "nick_name_short": "fs890918",
    "create_time": null,
    "org_exinfo": {
      "node_id": 495331480348,
      "node_name": "工程院技术开发部后端开发处",
      "org_id": 491036501742,
      "org_name": "ND",
      "org_user_code": "890918",
      "real_name": "林凡",
      "real_name_full": "linfan",
      "real_name_short": "lf"
    },
    "display_name": "粉丝890918",
    "icon": "http://betacs.101.com/v0.1/static/preproduction_content_cscommon/avatar/890918/890918.jpg?size=80"
  },
  "count": 0,
  "is_current_user_answer": false,
  "count_question_by_month": 2,
  "qa_type": null,
  "course_name": null
};
const options = {
  curr_user_id: 10005074,
  gw_host: 'http://localhost:9010',
  api_host: 'http://localhost:9010',
  on_del_command(id){
    console.log('删除', id);
  },
  on_edit_command(id){
    console.log('编辑', id);
  }
};
const params_1 = {
  question:question_1,
  options
};

const params_2 = {
  question:question_2,
  options
};

export {params_1, params_2};