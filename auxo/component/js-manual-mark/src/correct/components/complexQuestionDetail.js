/**
 * Created by Administrator on 2017/6/20 0020.
 */
import React from 'react';
var classNames = require('classnames');
import ScorePanel from './scorePanel'
import QuestionPlayer from '@sdp.nd/homework-question-player/src/forReact'
import baseConfig from '../../service/request-config'
import Manager from '@sdp.nd/nd-webcomponent-framework'
import FinalCorrectHistory from './finalCorrectHistory'
import Comment from './comment'

class QuestionDetail extends React.Component{
  constructor(props, context) {
    super()
    this.currentQuestion = null
  }

  componentWillMount() {
    this.currentQuestion = this.props.currentQuestion;
  }

  componentDidMount() {
    this.props.$$manager.listen('homework-question-player','rendered',function(data){
      $('div[questiontype]').each(function () {
          if($(this).attr('questiontype') == 'data') {
            $(this).hide();
          }
      })
    }.bind(this))

  }

  componentWillReceiveProps(obj) {
    this.currentQuestion = obj.currentQuestion;
  }

  componentDidUpdate() {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  }

  changeUrl(str) {
    while (str.indexOf('${ref-path}') >= 0){
      str = str.replace('${ref-path}', window.ref_path);
    }
    return str;
  }

  render() {
    if(!this.currentQuestion) {
      return (<div></div>)
    }

    const itemList = this.currentQuestion.question.content.items.map(function (item, index) {
      return (
        <div key={index}>
          {
            index == 0 ?
              <div style={{display:'inline-block'}}>
                <span dangerouslySetInnerHTML={{__html: this.changeUrl(item.prompt)}}></span>
              </div>:
              <div>
                <QuestionPlayer question={this.currentQuestion.question}
                                answerType="standard"
                                subNum={index}
                                ref_path={baseConfig.ref_path}></QuestionPlayer>
              </div>
          }
          {
            index == 0 ? null :
              <p>
                <i className="color-light-grey">答案：</i>
                <span
                  dangerouslySetInnerHTML={{__html: this.currentQuestion.question.content.responses[index-1].corrects?this.currentQuestion.question.content.responses[index-1].corrects:'暂无'}}></span>
              </p>
          }
          {
            index == 0 ? null :
              <p>
                <i className="color-light-grey">解析：</i>
                <span
                  style={{display:'inline-block'}}
                  dangerouslySetInnerHTML={{__html: this.currentQuestion.question.content.feedbacks[index * 2 - 1].content?this.currentQuestion.question.content.feedbacks[index * 2 - 1].content:'暂无'}}></span>
              </p>
          }
          {
            index == 0 ? null :
              <div className="main-content-stu-answer">
                <h3>学生答案</h3>
                <div className="answer-text">
                  <p>{this.currentQuestion.user_question_answer.subs[index - 1].answer ?this.currentQuestion.user_question_answer.subs[index - 1].answer :'该考生未作答'}</p>
                </div>
              </div>
          }
          {
            index == 0 ? null :
              <ScorePanel question={this.currentQuestion}
                          index={index - 1}
                          userPaperManualMark={this.props.userPaperManualMark}
                          changeScoreValue={this.props.changeScoreValue}
                          from={this.props.from}
                          minusScore={this.props.minusScore}
                          addScore={this.props.addScore}
                          togglePanel={this.props.togglePanel}/>
          }
          {
            (index != 0 && this.props.userInfo.type === 1)?
              <FinalCorrectHistory question={this.currentQuestion}
                                   index={index - 1}
                                   userPaperManualMark={this.props.userPaperManualMark}/> : null
          }
          {
            index == 0 ? null:
              <Comment question={this.currentQuestion}
                       selectComment={this.props.selectComment}
                       index={index - 1}
                       changeCommentValue={this.props.changeCommentValue} />
          }
        </div> )
    }.bind(this))

    return (
      <div>
        <h3>{this.currentQuestion.order_num}.{this.currentQuestion.question.question_type_name}</h3>

        {itemList}

      </div>
    )
  }
}

export default QuestionDetail
