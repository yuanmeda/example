import banner from './images/bg-answer.jpg';
import $ from 'jquery';
import ko from 'knockout';
import {ajax} from '../ajax';

function Model(params){
  const vm = this;
  const project_domain = params.project_domain;
  const static_host = params.static_host;
  const pk_id = params.pk_id;
  const pk_api_host = params.pk_api_host;
  const pk_gw_host = params.pk_gw_host;
  const el_mark_host = params.el_mark_host;
  const el_exam_api_host = params.el_exam_api_host;
  const res_srv_host = params.res_srv_host;
  const el_answer_api_host = params.el_answer_api_host;
  const el_note_api_host = params.el_note_api_host;
  const que_bank_gw_host = params.que_bank_gw_host;
  const el_per_exam_gw_host = params.el_per_exam_gw_host;
  const curr_user_id = params.curr_user_id;
  const rival_id =  params.rival_id;
  const language = params.language;
  const languageVarl = i18n[language]['learning'];
  const rival_marks = {}; // 对手改卷结果，以题目id为标识
  const paper_questions = {}; // 正在做的试卷

  let exam_session_id;
  let pk_rec_id;
  let all_questions_count = 0; // 题数（包含子题）


  vm.me_user_info = ko.observable({}); // 己方
  vm.me_exam = ko.observable(); // 试卷信息
  vm.me_score = ko.observable(0); // 做题时的得分
  vm.me_progress = ko.observable(); // 得分进度（与总分相除）

  vm.rival_user_info = ko.observable({}); // 对方
  vm.rival_exam = ko.observable();
  vm.rival_score = ko.observable(0);
  vm.rival_status = ko.observable(); // 对方状态 [0:作答中, 1:已结束]
  vm.rival_progress = ko.observable(); // 得分进度

  vm.exam_question_count = ko.observable(1); // 答题计数
  vm.paper_total_questions = ko.observable(); // 试卷总题数（不含子题）
  vm.paper_total_score = ko.observable(); // 试卷总分
  vm.time_countdown = ko.observable(' '); // 作答用时
  vm.ready_progress = ko.observable(0);
  vm.is_show_ready_popup = ko.observable(false);
  vm.is_loading = ko.observable(true);
  vm.is_alone = !rival_id; // 是否在与他人PK
  vm.banner = banner;

  init()
    .pipe(()=>{
      const me_exam_session = vm.me_exam();
      // 相关信息
      vm.paper_total_questions(me_exam_session.paper.question_count); // 题数（不包含子题）
      vm.paper_total_score(me_exam_session.paper.score);
      exam_session_id = me_exam_session.id;

      // 正在做的试卷，汇总试卷题目信息
      // 遍历试卷块
      $.each(me_exam_session.paper.parts, (idx, part)=>{
        // 遍历题目
        $.each(part.paper_questions, (idx, question)=>{
          // 每题成绩
          paper_questions[question.id] = {
            id: question.id,
            scores: question.scores
          };
        });
        // 题数汇总（包含子题）
        all_questions_count += part.sub_question_count;
      });
    })
    .pipe(get_rival_marks)
    .pipe(()=>{
      vm.is_loading(false);
      vm.is_show_ready_popup(true);
    })
    .pipe(ready)
    .pipe(()=>{
      vm.is_show_ready_popup(false);
      create_exam();
    })
    .always(()=>{
      vm.is_loading(false);
    });
let me_corrected_count = 0;
let rival_corrected_count = 0;
  /*创建作答*/
  function create_exam(){
    let me_answer_data;
    require.config({
      baseUrl:static_host
    });
    require(['studying.exam.factory', 'studying.enum'], function (factory, study_enum) {
      const exercise_config = {
        host: {
          'mainHost': el_exam_api_host, // 必填，测评组件API地址
          'resourceGatewayHost': res_srv_host, // 必填，资源网关API地址
          'answerGatewayHost': el_answer_api_host, // 必填
          'periodicExamHost':el_per_exam_gw_host,
          'noteServiceHost': el_note_api_host, // 必填，笔记组件API地址
          'questionBankServiceHost': que_bank_gw_host, // 必填，题库服务API地址
          'errorUrl': `${project_domain}/answer/error`, // 必填，初始化过程中发生流程错误是用户显示错误信息的页面，值为完整的URL地址
          'returnUrl': `${window.self_host}/${project_domain}/pk/${pk_id}/${vm.is_alone ? 'answer' : 'record'}/${pk_rec_id}/result` // 必填，结果页面地址
        },
        envConfig: {
          'sessionId': exam_session_id, // 必填，当前会话标识，PK考试sessionid
          'macKey': get_local_mac().mac_key, // 必填，mac_key，登录之后的mac_token中的key
          'userId': curr_user_id, // 必填，当前登陆用户的标志，用于笔记组件。
          'i18n': languageVarl, // 必填，多语言文本， 组件内部的显示的静态TEXT根据该对象的内的KEY来显示。
          'element': '#pk_exercise', // 可空，默认值“#exercise”。组件需要渲染到哪个DOM元素下，值为jQuery选择符。
          'language': language, // 可空，默认值“zh-CN”。当前系统的语言。
          'displayOptions': {
            "hideTimer": true,
            'hideNavigator': true, // 可空，默认值 false。是否隐藏答题卡。
            'showQuestionNum': false, // 是否隐藏题目编号，默认值为true
            'enableQuestionBank': false, // 是否启用题库服务, 默认值为true
            'showGotoLearnButton': false, // 是否显示去学习按钮，默认值为false
            'showQuizButton': false, // 是否显示去提问按钮，默认值为false
            disablePreButton: true,
            disableNextButton: false
          },
          'answerOptions': {
            'forceToAnswer': false // 5.4.2, 可空，默认为false,为true时用户只有在答完所有题目时才允许提交。
          },
          'tokenConfig': {
            // 必填，是否需要传递授权TOKEN
            'needToken': true,
            // 可空，如果needToken值为true时该回调必须
            'onGetToken': function(context){
              return {
                'Authorization': get_mac_token(context.method, context.path, context.host),
                'X-Gaea-Authorization': `GAEA id=${get_g_config().encode_gaea_id}`
              }
            }
          }
        },
        eventCallBack: {
          // 可空，答案保存成功后的回调。
          onAnswerSaved(data){
            me_answer_data = data;
          },
          // 可空，答案发生变更时的回调。
          onAnswerChange(data){},
          // 做题过程中可以接收外部的事情
          onNumberChanged(question_id, questionAnswerStatus){

          },
          onNextButtonClick(context){
            // 限制用户点击“下一题”按钮
            if(vm.exam_question_count() >= vm.paper_total_questions()){ return; }
            const me_answer_question_id = context.currentQuestionId;
            // 答题累计
            vm.exam_question_count(vm.exam_question_count() + 1);
            if(!me_answer_data || !me_answer_question_id){ return; }
            let is_me_answer_passed;
            let question_id = me_answer_question_id;
            // 我的答案是否正确
            let subs_count = 1;
            let answers = me_answer_data.data[0].Result.Answers;
            let answer = answers[`RESPONSE_${subs_count}-1`];
            while(answer){
              if(answer.state === 'PASSED'){
                // 答案正确，加分
                let curr_score = vm.me_score() + paper_questions[question_id].scores[subs_count-1];
                // 分数保留一位小数
                curr_score = window.parseFloat(curr_score.toFixed(1));
                vm.me_score(curr_score);
                me_corrected_count++;
                vm.me_progress(Math.round(me_corrected_count/all_questions_count * 100));
              }
              subs_count++;
              answer = answers[`RESPONSE_${subs_count}-1`];
            }

            // 有PK对手，同步PK对手信息
            if(!vm.is_alone && typeof rival_marks[question_id] !== 'undefined'){
              let rival_question_mark = rival_marks[question_id];
              let curr_score = 0;
              $.each(rival_question_mark.subs, (idx, sub)=>{
                // 批改结果中，未答对的统一为0分
                curr_score += sub.score;
                if(sub.status === 2){
                  // 从每个小题判断
                  rival_corrected_count++;
                }
              });
              curr_score = vm.rival_score() + curr_score;
              curr_score = window.parseFloat(curr_score.toFixed(1));
              vm.rival_score(curr_score);
              vm.rival_progress(Math.round(rival_corrected_count/all_questions_count * 100));
            }

            me_answer_data = null;
          },
          onSubmitCallBack(){},
          // 计时
          onTimerElapsed(timer){
            vm.time_countdown(timer.text);
          }
        }
      };
      const bussiness = factory.Studying.ExamBussinessFactory.CreateSingleModeExam(exercise_config);
      bussiness.init();
    });

  }

  /*获取自己的单题批改结果*/
  function get_me_mark(session_id, question_id, user_latest_answer_time){
    return ajax(`${el_mark_host}/v1/user_question_marks`, {
      type: 'GET',
      data:{
        session_id,
        question_id,
        user_latest_answer_time
      }
    })
  }

  /*获取对手已批改的答案*/
  function get_rival_marks(){
    const defer = $.Deferred();
    if(vm.rival_status() != 1){
      // 对手状态，未结束，不获取作答结果
      defer.resolve();
    }else{
      get_rival_mark_paper(0, ()=>{
        defer.resolve();
      }, defer.reject);
    }
    return defer.promise();
  }

  /*递归获取对手所有批改结果*/
  function get_rival_mark_paper(offset, on_done, on_error){
    const limit = 20;
    ajax(`${el_mark_host}/v1/user_question_marks/search`, {
      type: 'GET',
      data:{
        $filter: encodeURIComponent(`user_paper_mark_id eq ${vm.rival_exam().user_paper_mark_id}`),
        $limit: limit,
        $offset: offset,
        $result: 'pager'
      }
    })
      .then(res=>{
        // 对手批改情况
        $.each(res.items, (idx, item)=>{
          rival_marks[item.question_id] = {
            subs: item.subs
          };
        });

        if(offset + limit < vm.paper_total_questions()){
          // 继续获取改卷结果
          get_rival_mark_paper(offset + limit, on_done);
        }else{
          on_done();
        }
      }, on_error)
  }

  /*获取G_CONFIG*/
  function get_g_config(){
    let g_config = window.Nova.base64.decode(window.G_CONFIG);
    return JSON.parse(g_config);
  }

  /*cookie中的_G_MAC信息*/
  function get_local_mac(){
    const mac_key = get_g_config().cookie_mac_key;
    var _G__Authorization = $.cookie(mac_key);
    if (!_G__Authorization) {
      throw new Error('_G_MAC获取失败，需调试')
    }
    return JSON.parse(Nova.base64.decode(decodeURIComponent(_G__Authorization)))
    // const cookies = document.cookie.split(';');
    // let i = 0;
    // while (i < cookies.length) {
    //   let cookie = $.trim(cookies[i]);
    //   let r = new RegExp(`^${mac_key}=`);
    //   if (r.test(cookie)) {
    //     let mac = cookie;
    //     mac = mac.split('=').pop();
    //     mac = window.decodeURIComponent(mac);
    //     mac = window.Nova.base64.decode(mac);
    //     mac = JSON.parse(mac);
    //     return mac;
    //   }
    //   i++;
    // }
    // throw new Error('_G_MAC获取失败，需调试');
  }

  function get_mac_token(method, url, host) {
    return Nova.getMacToken(method, url, host);
  }

  /*自己玩*/
  function pk_alone(){
    return ajax(`${pk_gw_host}/v1/pk_answers?pk_id=${pk_id}`, {
      type: 'POST'
    })
      .then(res=>{
        pk_rec_id = res.id;
        set_pk_user('me', res.user, res.user_exam_session);
        return res;
      })
  }

  /*与别人PK*/
  function pk_against(){
    return ajax(`${pk_gw_host}/v1/pk_record/actions/challenge?pk_id=${pk_id}&rival_id=${rival_id}`, {
      type: 'POST'
    })
      .then(res=>{
        pk_rec_id = res.id;
        // PK双方角色在服务器端已设置，需要根据用户ID重新划分挑战者和守擂者
        let pk_seq = ['challenger', 'defender'];
        if(res.challenger.user_id != curr_user_id){
          pk_seq = ['defender', 'challenger'];
        }
        const me_user_info = res[pk_seq[0]];
        const me_pk_answer = res[`${pk_seq[0]}_pk_answer`];
        const me_exam_session = me_pk_answer && me_pk_answer.user_exam_session;

        const rival_user_info = res[pk_seq[1]];
        const rival_pk_answer = res[`${pk_seq[1]}_pk_answer`];
        const rival_exam_session = rival_pk_answer && rival_pk_answer.user_exam_session;

        set_pk_user('me', me_user_info, me_exam_session);
        set_pk_user('rival', rival_user_info, rival_exam_session);

        // 对手状态
        vm.rival_status(rival_pk_answer && rival_pk_answer.status || 0);
        return res;
      })
  }

  /*设置PK双方信息*/
  function set_pk_user(side, user_info, exam_session){
    user_info.icon +=  '&defaultImage=1';
    vm[`${side}_user_info`](user_info);
    vm[`${side}_exam`](exam_session);
  }

  /*初始化*/
  function init(){
    // 发起挑战或闯关
    if(vm.is_alone){
      return pk_alone()
    }
    return pk_against()
  }

  /*准备开始PK*/
  function ready(){
    const defer = $.Deferred();
    if(vm.is_alone){
      // 单独闯关
      defer.resolve();
    }else{
      window.setTimeout(()=>{
        ready_popup_process(()=>{
          defer.resolve();
        });
      }, 1000);
    }
    return defer.promise();
  }

  /*准备开始弹窗进度条*/
  function ready_popup_process(on_ready){
    window.setTimeout(()=>{
      let progress = vm.ready_progress() + 4;
      // 重置progress数据，防止超过100
      if(progress >= 100){
        progress = 100;
      }
      vm.ready_progress(progress);
      if(progress === 100){
        window.setTimeout(()=>{on_ready();}, 1000);
      }else{
        ready_popup_process(on_ready);
      }
    }, 100);
  }

  function debug_enable_pk(){
    return ajax(`${pk_api_host}/v1/pks/${pk_id}/enabled/true`, {type: 'PUT'})
  }
}

export {Model};