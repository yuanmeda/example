/**
 * Created by Administrator on 2017/6/20 0020.
 */
import React from 'react';
var classNames = require('classnames');
import QuestionPlayer from '@sdp.nd/homework-question-player/src/forReact'
import Manager from '@sdp.nd/nd-webcomponent-framework'
import baseConfig from '../../service/request-config'
import ScorePanel from './scorePanel'
import {injectIntl} from 'react-intl'
import FinalCorrectHistory from './finalCorrectHistory'
import Comment from './comment'

@injectIntl
class QuestionDetail extends React.Component{
  constructor(props, context) {
    super()
    this.currentQuestion = null
    this.renderId = 0
  }

  componentWillMount() {
    this.currentQuestion = this.props.currentQuestion;
  }

  componentDidMount() {
    this.props.$$manager.listen('homework-question-player','rendered',function(data){}.bind(this))
  }

  componentWillReceiveProps(obj) {
    this.currentQuestion = obj.currentQuestion;
  }

  componentDidUpdate() {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  }

  //离开页面时，取消监听
  componentWillUnmount() {
    Manager.cancel(this.renderId)
  }

  render() {
    const {formatMessage}  = this.props.intl

    if(!this.currentQuestion) {
      return (<div></div>)
    }

    return (
      <div>
        <div className="main-content-question-text">
          <h3>{this.currentQuestion.order_num}.{this.currentQuestion.question.question_type_name}</h3>
          <QuestionPlayer question={this.currentQuestion.question}
                          answerType="standard"
                          ref_path={baseConfig.ref_path}></QuestionPlayer>
          <div>
            {/* 答案 */}
            <i className="color-light-grey">{formatMessage({id: 'question.answer'})}：</i>
            {/* 看 */}
            <span style={{display:'inline-block'}}  dangerouslySetInnerHTML={{__html: this.currentQuestion.standardAnswer?this.currentQuestion.standardAnswer:formatMessage({id: 'question.nop'})}}></span>
          </div>
          <div>
            <i className="color-light-grey">{formatMessage({id: 'question.parsing'})}：</i>
            {/* 暂无 */}
            <span style={{display:'inline-block'}} dangerouslySetInnerHTML={{__html: this.currentQuestion.analyze?this.currentQuestion.analyze:formatMessage({id: 'question.nop'})}}></span>
          </div>
        </div>
        <div className="main-content-stu-answer">
          {/* 学生答案 */}
          <h3>{formatMessage({id: 'question.stdAnswer'})}</h3>
          <div className="answer-text">
            {/* 该考生未作答 */}
            <p>{this.currentQuestion.user_question_answer.subs[0].answer ?this.currentQuestion.user_question_answer.subs[0].answer :formatMessage({id: 'question.noStdAnswer'})}</p>
          </div>
        </div>

        <ScorePanel question={this.currentQuestion}
                    index="0"
                    userPaperManualMark={this.props.userPaperManualMark}
                    changeScoreValue={this.props.changeScoreValue}
                    from={this.props.from}
                    minusScore={this.props.minusScore}
                    addScore={this.props.addScore}
                    togglePanel={this.props.togglePanel}/>
        {
          this.props.userInfo.type === 1?
            <FinalCorrectHistory question={this.currentQuestion}
                                 index="0"
                                 userPaperManualMark={this.props.userPaperManualMark}/> : null
        }
        {
          <Comment question={this.currentQuestion}
                   selectComment={this.props.selectComment}
                   index="0"
                   changeCommentValue={this.props.changeCommentValue} />
        }
      </div>
    )
  }
}

export default QuestionDetail
