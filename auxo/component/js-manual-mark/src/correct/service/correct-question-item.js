/**
 * Created by Administrator on 2017/6/17.
 */

class correctRecord{

	constructor(){
		this.lowestScore = 0;
		this.hightestScore = 0;
		this.averageScore = 0;
		this.records = [];
	}

	//计算最大值，最小值，平均值
	_calculate(){

	}

}



import Request from '../../service/rest.service';
import baseConfig from '../../service/request-config'
import CryptoJS from '../../service/hmac-sha256'
import correctService from './correctService'

var csTemp = {
  development: 'prepub_content_edu_product',
  test:'prepub_content_edu_product',
  preproduction:'preproduction_content_edu_prod',
  product:'edu_product'
}

export default class{

	constructor(item, index, paper, formatMessage){
		this.question = item.question;			//习题对象
    this.question.href = this.getQuestionHref();
    this.question.question_type_name = correctService.getQuestionName(this.question.type);
    this.question.question_type_code = item.question.content.items?item.question.content.items[0].type:'';
		this.user_question_answer = item.user_question_answer;					//用户题目作答信息
		this.user_question_manual_mark = item.user_question_manual_mark;					//用户题目人工批改信息
    this.order_num = index + 1;       //题目序号
    this.score = [];  //初始化分数，打分
    this.showPanel = false;
    this.questionOriginScore = null;
    this.batchCorrectInfo = [];   //历史批改信息，终审使用
    this.history = [];
    this.setUserAnswer();
    this.setStandardAnswer();
    this.setAnalyze();
    this.getQuestionOriginScore(paper);
    this.setScores();
    this.setCommentModel(formatMessage);
  }

  setCommentModel(formatMessage) {
    if(this.user_question_manual_mark) {
      return
    }

    var comments = new Array(this.user_question_answer.subs.length);
    _.forEach(comments, function (comment, index) {
      comments[index] = [
        {
          comment: formatMessage({id: 'comment.analyzeQuestionBad'}),
          checked:false
        },
        {
          comment: formatMessage({id: 'comment.Illegible'}),
          checked:false
        }
      ];    //评语模板
    })

    this.comments = comments;

    var commentTextValue = new Array(this.user_question_answer.subs.length);   //写评语输入框
    _.forEach(commentTextValue, function (textValue, index) {
      commentTextValue[index] = ''
    })
    this.commentTextValue = commentTextValue;
  }

  setUserAnswer() {
    for(var i = 0; i<this.user_question_answer.subs.length; i++) {
      this.user_question_answer.subs[i].answer = correctService.getUSerAnser(this.user_question_answer.subs[i].answer)
    }
  }

  setStandardAnswer() {
    var answerList = [];
    _.forEach(this.question.content.responses, response=> {
      answerList.push(response.corrects?response.corrects.concat():'')
    })

    this.standardAnswer = this.changeUrl(answerList.join(','))
  }

  setAnalyze() {
    var analyzeList = [];
    _.forEach(this.question.content.feedbacks, feedback=> {
      if(feedback.identifier == 'showAnswer') {
        analyzeList.push(feedback.content)
      }
    })

    this.analyze = this.changeUrl(analyzeList.join(','))
  }

  changeUrl(str) {
    while (str.indexOf('${ref-path}') >= 0){
      str = str.replace('${ref-path}', window.ref_path);
    }
    return str;
  }

  getQuestionHref() {
    var temp = "${ref-path}/" + (csTemp[window.env]?csTemp[window.env]: csTemp['product']) + "/esp/questions/" + this.question.id + ".pkg/item.xml"
    return temp
  }

  //题目原本分数
  setScores() {
    if(this.user_question_manual_mark) {
      this.scores = [];
      _.forEach(this.user_question_manual_mark.subs, sub => {
        this.score.push(sub.score)
      })
    } else {
      this.score = new Array(this.user_question_answer.subs.length)
    }
  }

	getQuestionOriginScore(paper) {
	  var _this = this;
    if(!paper) {
      return
    }

    _.forEach(paper.parts, function (paperPart) {
      _.forEach(paperPart.paper_questions, function (paper_question) {
        if(_this.question.id == paper_question.id) {
          _this.questionOriginScore = paper_question.scores
        }
      })
    })
  }

  isScoreOk() {
    var finished = true;
    for(var i = 0; i< this.score.length; i++) {
      if(isNaN(this.score[i])) {
        finished = false;
      }
    }

    return finished;
  }

  checkScoreEqual() {
    var totalScore = 0;
    _.forEach(this.score, item=> {
       totalScore = totalScore + Number(item)
    });

    this.totalScore = totalScore;

    var originScore = 0
    _.forEach(this.questionOriginScore, item=> {
      originScore = originScore + Number(item);
    });

    return totalScore == originScore
  }

	//保存批改结果
	save(callback, user_paper_manual_mark_id){
	  //未评分时直接返回
	  if(!this.isScoreOk()) {
	    if(typeof callback === 'function') {
        callback();
      }
      return;
    }

    // var comment = '';
    // if(!this.user_question_manual_mark) {
    //   comment = this.makeComment();
    //
    // } else {
    //   comment = this.user_question_manual_mark.remark;
    // }

    var subs = [];
    for(var i = 0; i< this.score.length; i++) {
      subs.push({
        'status': this.score[i] == this.questionOriginScore[i] ? 'CORRECT':'WRONG',
        'score': Number(this.score[i]),
        'addition':null,
        'remark': this.makeComment(i)
      })
    }
    var params = [{
      'question_id': this.question.id,
      'status': this.checkScoreEqual() ? 'CORRECT':'WRONG',
      'score': this.totalScore,
      'addition':null,
      'remark': this.makeComment(0),
      'subs': subs
    }]


    var hash = CryptoJS.HmacSHA256(JSON.stringify(params.concat()), this.getMacKey());
    var mac_body = encodeURIComponent(CryptoJS.enc.Base64.stringify(hash));

    Request.saveUserQuestionMarks(user_paper_manual_mark_id, mac_body, params).then(data => {
      this.user_question_manual_mark = data[0];
      if(typeof callback === 'function') {
        callback()
      }
    }, () => {
      if(typeof callback === 'function') {
        callback()
      }
    })
	}

	getMacKey() {
	  if(window.manualMock) {
	    return baseConfig.token.mac_key
    }

    var global_config = window.G_CONFIG && JSON.parse(base64_decode(window.G_CONFIG));
    var _ref = global_config || {};
    var cookie_mac_key = _ref.cookie_mac_key;

    var _mac = this.gmac(cookie_mac_key);
    if (!_mac) return void 0;
    var json = void 0;
    try {
      json = JSON.parse(base64_decode(_mac));
    } catch (e) {}

    return json? json.mac_key:'3hNZ8i8cte'
  }

  gmac(cookie_mac_key) {
    if (!cookie_mac_key) return "";
    return this.getCookie(cookie_mac_key);
  }

  getCookie(name) {
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
      return unescape(arr[2]);
    else
      return null;
  }

	makeComment(index) {
    if(this.user_question_manual_mark) {
      return this.user_question_manual_mark.subs[index].remark;
    } else {
      var comment = '';
      _.forEach(this.comments[index], function (item) {
        if(item.checked) {
          comment = comment + item.comment + ','
        }
      })

      if($.trim(comment + this.commentTextValue[index])) {
        return comment + this.commentTextValue[index]
      } else {
        return null
      }
    }
  }

	setCorrectRecord(correctRecord){
		this.correctRecord = correctRecord;
	}

	//评语是否合法
	ifCommentValid(){

	}


}
