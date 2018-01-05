/**
 * Created by Administrator on 2017/6/25 0025.
 */

import {QUESTION_CONFIG} from '../common/constant'
export default {
  getUSerAnser (input, type, questionType) {
    var removeHtml = function(str) {
      str = $.trim(str);
      if (!str) {
        return "--"
      } else {
        var temp = str.replace(/\\n\\r/g, "<br>");
        return temp == '<br>'?"--":temp;
      }
    }

    if (input == null || input == "") return "--";
    var answerObj = _.isObject(input) ? input : JSON.parse(input);
    //12.4 增加对新模型的支持
    if (answerObj.player_result) {
      answerObj = typeof answerObj.player_result === 'string' ? JSON.parse(answerObj.player_result) : answerObj.player_result;
    }
    var answers = [];
    switch (type) {
      case 'directive-answers':  //基础指令题-学生答案
        if (questionType == "textentry") {
          if (_.isArray(answerObj.answers)) {
            //var list = [];
            //$.each(answerObj.answers, function (index, answer) {
            //    list.push("<latex>\\(" + answer + "\\)</latex>")
            //});
            //return list.join(",")
            for (var i = 0; i < answerObj.answers.length; i++) {
              answerObj.answers[i] = answerObj.answers[i].replace(/\\n\\r/g, "<br>")
            }
            return answerObj.answers.join(",")
          } else {
            //return "<latex>\\(" + answerObj.answers + "\\)</latex>"
            return answerObj.answers
          }
        } else {
          var directiveAnswer = _.isArray(answerObj.answers) ? answerObj.answers.join(',') : answerObj.answers;
          return directiveAnswer ? directiveAnswer : "--";
        }
        break;
      case 'directive-corrects':  //基础指令题-
        if (questionType == "textentry") {
          if (_.isArray(answerObj.corrects)) {
            //var list = [];
            //$.each(answerObj.corrects, function (index, answer) {
            //    list.push("<latex>\\(" + answer + "\\)</latex>")
            //});
            //return list.join(",")
            for (var i = 0; i < answerObj.corrects.length; i++) {
              answerObj.corrects[i] = answerObj.corrects[i].replace(/\\n\\r/g, "<br>")
            }
            return answerObj.corrects.join(",")
          } else {
            //return "<latex>\\(" + answerObj.corrects + "\\)</latex>"
            return answerObj.corrects
          }
        } else {
          var directiveAnswer = _.isArray(answerObj.corrects) ? answerObj.corrects.join(',') : answerObj.corrects;
          return directiveAnswer ? directiveAnswer : "--";
        }
        break;
      case 'data':
        var answer;
        if (subId) {
          var subAnswer = [];
          answer = answerObj["RESPONSE_" + n + "-1"];
          for (var i = 0; i < answer.value.length; i++) {
            subAnswer.push(removeHtml(answer.value[i]));
          }
          answers.push(subAnswer.join(","));
        } else {
          for (var n = 1; ; n++) {
            var subAnswer = [];
            answer = answerObj["RESPONSE_" + n + "-1"];
            if (typeof(answer) != "undefined" && answer.value != null) {
              for (var i = 0; i < answer.value.length; i++) {
                subAnswer.push(removeHtml(answer.value[i]));
              }
              answers.push("(" + n + "):" + subAnswer.join(","));
            }
            else {
              break;
            }
          }
        }
        break;
      case  'textentry':   //填空题
        for (var n = 1; ; n++) {
          var answer = answerObj["RESPONSE_1-" + n];
          if (typeof(answer) != "undefined" && answer.value != null) {
            for (var i = 0; i < answer.value.length; i++) {
              answers.push(removeHtml(answer.value[i]));
            }
          }
          else {
            break;
          }
        }
        break;
      case  'handwrite':  //手写题，排除手写的base64码的内容
        for (var n = 2; ; n++) {
          var answer = answerObj["RESPONSE_1-" + n];
          if (typeof(answer) != "undefined" && answer.value != null) {
            for (var i = 0; i < answer.value.length; i++) {
              answers.push(removeHtml(answer.value[i]));
            }
          }
          else {
            break;
          }
        }
        break;
      default:
        for (var x in answerObj) {
          var value = answerObj[x].value;
          if (value == null) {
            answers.push(answerObj[x].join(','));
          } else {
            if (value.length > 0) {
              answers.push(value.join(','));
            }
          }
        }
    }
    return answers.length == 0 ? "--" : answers.join(',');
  },

  getQuestionName(type) {
    var question_name = '';
    for(var i = 0; i< QUESTION_CONFIG.length; i++){
      if(type === QUESTION_CONFIG[i].question_code) {
        question_name = QUESTION_CONFIG[i].question_name;
      }
    }

    return question_name;
  }
}
