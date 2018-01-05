var RestRequest = null;
var NoAuthRestRequest = null;
if(window.manualMock) {
  RestRequest = require('./requestMock').RestRequest
  NoAuthRestRequest = require('./requestMock').NoAuthRestRequest
} else {
  RestRequest = require('./request').RestRequest
  NoAuthRestRequest = require('./request').NoAuthRestRequest
}

import MD5 from "./mod_nd_md5"
import config from './request-config'
import utils from './util'

config.toast = utils.showMsg;

const mockHost = 'http://localhost:8080';
const ucHost = config.gateway + '/' + window.projectCode;   //经过服务端中转，不直接走uc接口
window.gateway = config.gateway    //网关地址
/**
 *
 * mockHost用于本地mock服务端接口,使用方式如下：
 *
 * RestRequest(mockHost).url('/pre_questions/question/7').get().then(function(data){
 *	console.info(data);
 * });
 */
export default {
  mockToken: function () {
    return NoAuthRestRequest(window.uc_host).url('/v0.93/tokens').post({
      login_name:'10005074',
      password:MD5('qa123456'),
      org_name:'ND'
    })
  },
  checkMac: function (param) {
    return NoAuthRestRequest().url('/users/actions/mac_check').post(param)
  },
  getArticles: function () {
    return RestRequest(mockHost).url('/api/v0.1/articles').get()
  },
  addArticle: function (param) {
    return RestRequest(mockHost).url('/api/v0.1/articles').post(param)
  },
  // getCorrectList: (param) => RestRequest(mockHost).url('/api/v0.1/correct-list').get(param),
  getCorrectList: (param) => {
    const url = `/v1/users/${param.user_id}/manual_marks`
    delete param.user_id;
    return RestRequest().url(url).get(param)
  },
  // getCorrectSettingConfig: (exam_id) => RestRequest(mockHost).url('/api/v0.1/correct-setting').get(),
  getCorrectSettingConfig: (exam_id) => RestRequest().url(`/v1/exams/${exam_id}/manual_marks`).get(),
  // postCorrectSettingConfig: (exam_id, config) => RestRequest(mockHost).url(`/api/v0.1/correct-setting`).post({ mark_strategy: config}),
  postCorrectSettingConfig: (exam_id, config) => RestRequest().url(`/v1/exams/${exam_id}/manual_marks`).post(config),
  getCorrectDetail: function () {
    return RestRequest(mockHost).url('/api/v0.1/correctDetail').get()
  },
  getAnswerList: function (param) {
    return RestRequest(gateway).url('/v1/user_paper_manual_mark_info').get(param)
    // return RestRequest(mockHost).url('/api/v0.1/answerList').get(param)
  },
  //获取用户试卷信息
  getUserPaperInfo: function (user_paper_manual_mark_id) {
    return RestRequest(gateway).url('/v1/user_paper_info/' + user_paper_manual_mark_id).get()
  },
  //提交用户试卷批改记录
  submitUserPaperMarks: function (user_paper_manual_mark_id) {
    return RestRequest().url('/v1/user_paper_manual_marks/' + user_paper_manual_mark_id + '/actions/submit').put()
  },
  //保存用户题目批改信息
  saveUserQuestionMarks: function (id, mac_body, params) {
    return RestRequest().url('/v1/user_question_manual_marks?user_paper_manual_mark_id=' + id +'&mac_body=' + mac_body).put(params)
  },
  //查询用户题目批改信息
  getQuestionManualMasks: function (params) {
    var temp = {
      filter: 'user_question_manual_mark_id eq ' + params.user_question_manual_mark_id,
      order: 'create_time desc',
      limit: 100
    }
    return RestRequest().url('/v1/user_question_manual_mark_logs/search').post(temp)
  },
  getUserInfo: function (user_id) {
    return RestRequest(ucHost).url('/v0.93/users/' + user_id).get()
  },
  getNodeChildNodes: function (orgId, nodeId) {
    return RestRequest(ucHost).url('/v0.93/organizations/' + orgId + '/orgnodes/' + nodeId + '/childnodeamounts?$offset=0&$limit=100').get()
  },
  getNodeChildUsers: function (orgId, nodeId) {
    return RestRequest(ucHost).url('/v0.93/organizations/' + orgId + '/orgnodes/' + nodeId + '/users?$offset=0&$limit=100').get()
  },
  searchUsers: function (orgId, key) {
    return RestRequest(ucHost).url('/v0.93/organizations/' + orgId + '/orgnodes/0/users/actions/search?name=' + encodeURIComponent(key) + '&$offset=0&$limit=100').get()
  },
  batchGetUserInfo: function (params) {
    return RestRequest(ucHost).url('/v0.93/users/actions/query').post(params)
  },
  //查询下一份未批改的答卷
  getNextUserPaper: function (exam_id, params) {
    return RestRequest(gateway).url('/v1/exams/' + exam_id + '/user_paper_manual_mark/actions/next').get(params)
  },
  //批量获取用户题目批改信息
  getBatchCorrectInfo: function (params) {
    return RestRequest(gateway).url('/v1/user_question_mark_info').get(params)
  },
  //查询批改人角色信息
  getCorrectUserInfo: function (judge_id) {
    return RestRequest().url('/v1/judges/search').post({
      filter: 'id eq ' +judge_id
    })
  },
}
