/**
 * Created by Administrator on 2017/6/17.
 */


//查看类型：全部习题 ，待批改习题
const VISIBLE_TYPE = {
	ALL:'all',
	UNCORRECT:'uncorrect'
};

import CorrectQuestionItem from './correct-question-item';
import Request from '../../service/rest.service';
import _ from 'lodash'

export default class{
	constructor(){
		this.uncorrectQuestionNum = 0;
		this.correctedQuestionNum = 0;
		this.list = [];
		this.current = null;
    this.exam = null;
    this.user_paper_manual_mark = null;
    this.uc_user_display_facade = null;
    this.score = null;
    this.from = null;
    this.studentList = [];  //学生列表，待批改、待提交成绩、查看
    this.paper = null;  //试卷信息
    this.nextStudent = null;  //下一份答卷（学生）
    this.userInfo = null;
	}

	setStudentList(list) {
	  this.studentList = list;
  }

  //计算分数
  _calculate(){
    var score = 0;
    _.forEach(this.list, (item) => {
      if(item.user_question_manual_mark) {
        _.forEach(item.user_question_manual_mark.subs, sub => {
          score = score + Number(sub.score)
        })
      }
    })

    this.score = score;
  }


  //是否显示'提交批改结果'， 全部批改完或者仅剩一题
	showCommitResult(){
	  return this.getUncorrectedNum() == 0 || (this.getUncorrectedNum() == 1 && !this.current.user_question_manual_mark)
	}

	//未批改数量
  getUncorrectedNum() {
    var unCorrectNum = 0;
    _.forEach(this.list, (item,index) => {
      if(!item.user_question_manual_mark) {
        unCorrectNum++;
      }
    })

    return unCorrectNum
  }

  //是否还有下一个学生
  getNextStudent() {
    var type = '';
    if(this.from == 'correct') {
      type = 0;
    } else if(this.from == 'review') {
      type = 1
    }

    if(this.user_paper_manual_mark.status == 2) {
      type = 2;
    }

    return new Promise((resolve,reject)=>{
      Request.getNextUserPaper(this.exam.exam_id, {
        type: type,
        create_time:  encodeURIComponent(this.user_paper_manual_mark.create_time)
      }).then(data => {
        this.nextStudent = data?data.id:''
        resolve();
      }, () => {
        resolve();
      })
    });
  }

  setCurrentQuestionShow(callback) {
    this.current.ifAllCorrectedCompleted = (this.getUncorrectedNum() == 0);
    this.current.showCommitResult = this.showCommitResult();

    //最后一题，以题号为准
    this.current.lastQuestion = (this.current.order_num == this.list.length);
    this.current.hasNextStudent = (this.current.lastQuestion && this.nextStudent);
    this.current.showPanel = false;

    this.uncorrectQuestionNum = this.getUncorrectedNum();
    this.correctedQuestionNum = this.list.length - this.getUncorrectedNum();

    this._calculate();

    //终审人员角色
    if(this.userInfo.type == 1) {
      Request.getBatchCorrectInfo({
        question_id: this.current.user_question_answer.question_id,
        session_id: this.current.user_question_answer.session_id
      }).then(batch => {
        this.current.batchCorrectInfo = batch;
        this.setFinalShow();
        if(this.current.user_question_manual_mark) {
          Request.getQuestionManualMasks({
            user_question_manual_mark_id :this.current.user_question_manual_mark.id
          }).then(data => {
            this.current.history = data.items
            if (typeof callback === 'function') callback()
          })
        } else {
          if (typeof callback === 'function') callback()
        }
      })
    } else {
      //查看时，调用
      if(this.current.user_question_manual_mark) {
        Request.getQuestionManualMasks({
          user_question_manual_mark_id :this.current.user_question_manual_mark?this.current.user_question_manual_mark.id:''
        }).then(data => {
          this.current.history = data.items
          if (typeof callback === 'function') callback()
        }, function () {
          if (typeof callback === 'function') callback()
        })
      } else {
        if (typeof callback === 'function') callback()
      }
    }
  }

  setFinalShow() {
    var showAverage = false;
    var scoreList = [];
    _.forEach(this.current.batchCorrectInfo, function (item, indexItem) {
      if(item.user_question_mark) {
        showAverage = true;

        scoreList.push(item.user_question_mark)
      }
    })

    this.current.showAverage = showAverage;

    if(scoreList.length > 0) {
      var scoreTemp = [];
      var averageScore = [];
      _.forEach(scoreList[0].subs, function (sub, subIndex) {
        var questionItem = [];
        _.forEach(scoreList, function (score) {
          questionItem.push(score.subs.length >= subIndex?score.subs[subIndex].score:'')
        })

        questionItem.sort(function (a,b) {
          return a-b
        });
        scoreTemp.push(questionItem);

        var total = 0;
        _.forEach(questionItem, function (item) {
          total = total + Number(item);
        })
        averageScore.push((total / scoreList.length).toFixed(1))
      })

      this.current.finalScoreShow = scoreTemp;
      this.current.averageScore = averageScore;
    }
  }

	//第一个批改对象
	getFirstItem(){

	}

	//下一个批改对象
	getNextItem(callback){
	  this.getItem(this.current.order_num + 1, callback)
	}


	//前一个批改对象
	getPreItem(callback){
    this.getItem(this.current.order_num - 1, callback)
	}

	filterItem(order_num, callback) {
    var filterList = _.where(this.list, {'order_num': order_num});
    if(filterList) {
      this.current = filterList[0];
      this.getNextStudent().then(data => {
        this.setCurrentQuestionShow(callback);
      })
    }
  }


	//通过order_num查询批改项
	getItem(index, callback){
    if(this.user_paper_manual_mark.status == 2) {
      this.filterItem(index, callback)
    } else {
      this.save(function () {
        this.filterItem(index, callback)
      }.bind(this))
    }
	}

	//是否保存批改结果
  canSaveCorrectInfo() {
    if(this.user_paper_manual_mark.status == 2) {
      return false;
    }

    var subScore = [];
    if(this.current.user_question_manual_mark && this.current.user_question_manual_mark.subs) {
      subScore = _.pluck(this.current.user_question_manual_mark.subs, 'score');
    }
    if(this.current.user_question_manual_mark && subScore.toString() == this.current.score.toString()) {
      return false;
    }

    if($.inArray('', this.current.score) != -1) {
      return false;
    }

    return true;
  }

	//保存习题批改结果
	save(callback){
	  if(!this.canSaveCorrectInfo()) {
	    return callback()
    }
		return this.current.save(callback, this.user_paper_manual_mark.id);
	}

	//提交批改结果
	submit(callback) {
	  var _this = this;
    this.save(function () {
      Request.submitUserPaperMarks(_this.user_paper_manual_mark.id).then(data => {
        if(typeof callback == 'function') {
          callback();
        }
      })
    })
  }

}
