/**
 * Created by Administrator on 2017/6/17.
 */



import Correct from './correct';
import CorrectQuestionItem from './correct-question-item';
import Requset from '../../service/rest.service';
import _ from 'lodash'

export default class extends Correct{
  constructor(formatMessage) {
    super()
    this.formatMessage = formatMessage
  }
  init(user_paper_manual_mark_id, from){
    this.from = from;
    return new Promise((resolve,reject)=>{
    //请求数据
      Requset.getUserPaperInfo(user_paper_manual_mark_id).then((data)=>{
        Requset.getCorrectUserInfo(data.user_paper_manual_mark.judge_id).then(userInfo => {   //判断用户角色
          this.userInfo = (userInfo.items?userInfo.items[0]:{});
          this._initData(data, function () {
            resolve();
          });
        })
      });

    });

  }

  //数据初始化
  _initData(data, callback){
    let items = data.user_question_answers;
    let list = [];
    _.forEach(items,(item, index)=>{
      list.push(new CorrectQuestionItem(item, index, data.paper, this.formatMessage));
    });

    this.list = list;
    this.exam = data.exam_manual_mark;
    this.user_paper_manual_mark = data.user_paper_manual_mark;
    this.uc_user_display_facade = data.uc_user_display_facade;
    this.score = data.score;
    this.paper = data.paper;

    //获取第一个待批改对象
    if(this.getUncorrectedNum() == 0) {
      this.current = list[0]
    } else {
      var firstQuestion = null;
      _.forEach(this.list,(item, index)=>{
        if(!item.user_question_manual_mark) {
          firstQuestion = item;
          return false;
        }
      });
      this.current = firstQuestion;
    }

    this.getNextStudent().then(data => {
      this.setCurrentQuestionShow(callback);
    })
  }

}
