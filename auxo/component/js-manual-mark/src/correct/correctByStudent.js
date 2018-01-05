import React from 'react'
import { hashHistory, Link } from 'react-router'
import Manager from '@sdp.nd/nd-webcomponent-framework'
import '@sdp.nd/nd-webcomponent-framework/src/adapter/react'
import QuestionDetailComponent from './components/questionDetail'
import ComplexQuestionDetailComponent from './components/complexQuestionDetail'
import QuestionCard from './components/questionCard'
import CorrectButtons from './components/correctButtons'
import service from './service/correct-by-student'
import { injectIntl, intlShape } from 'react-intl'
var QuestionDetail = Manager.wrap('question-detail',QuestionDetailComponent,Manager.TYPE.REACT);
var ComplexQuestionDetail = Manager.wrap('complex-question-detail',ComplexQuestionDetailComponent,Manager.TYPE.REACT);

let correctService
module.exports = injectIntl(React.createClass({
  propTypes: {
    params: React.PropTypes.object  // this.props.params.id ===> user_paper_manual_mark_id
  },

  imgNode: null,
  imgLoadTimes: 0,

  getInitialState() {
    return {
      userPaperManualMark: null,
      currentQuestion: null,
      questionItems: null,
      uncorrectQuestionNum: 0,
      correctedQuestionNum: 0,
      exam: null,
      score: 0,  //总分
      uc_user_display_facade: null,
      userInfo: null,
    }
  },

  componentWillMount() {
    //TODO 数据初始化，接口调用
    const {formatMessage} = this.props.intl
    correctService = new service(formatMessage)
    correctService.init(this.props.params.id, this.props.params.type).then((data) => {
      this.setData()
    })
  },

  setData() {
    this.setState({
      userPaperManualMark: correctService.user_paper_manual_mark,
      currentQuestion: correctService.current,
      uncorrectQuestionNum: correctService.uncorrectQuestionNum,
      correctedQuestionNum: correctService.correctedQuestionNum,
      questionItems: correctService.list,
      exam: correctService.exam,
      score: correctService.score,
      uc_user_display_facade: correctService.uc_user_display_facade,
      userInfo: correctService.userInfo
    })
  },

  componentDidUpdate() {
    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
  },

  //写评语选择回调
  selectComment(questionIndex, commentIndex) {
    this.state.currentQuestion.comments[questionIndex][commentIndex].checked = !this.state.currentQuestion.comments[questionIndex][commentIndex].checked;
    this.setState({
      currentQuestion: this.state.currentQuestion
    })
  },

  //写评语textarea回调
  changeCommentValue(questionIndex, str) {
    this.state.currentQuestion.commentTextValue[questionIndex] = str;
    this.setState({
      currentQuestion: this.state.currentQuestion
    })
  },

  //打分面板回调
  changeScoreValue(val, index) {
    this.state.currentQuestion.score[index] = val;
    this.setState({
      currentQuestion: this.state.currentQuestion
    })
  },

  minusScore(index) {
    if(!isNaN(this.state.currentQuestion.score[index]) && this.state.currentQuestion.score[index] > 0) {
      this.state.currentQuestion.score[index] = (Number(this.state.currentQuestion.score[index]) - 1).toFixed(1);
      this.setState({
        currentQuestion: this.state.currentQuestion
      })
    }
  },

  addScore(index){
    if(isNaN(this.state.currentQuestion.score[index])) {
      this.state.currentQuestion.score[index] = 0;
    }

    if(!isNaN(this.state.currentQuestion.score[index]) && this.state.currentQuestion.score[index] < this.state.currentQuestion.questionOriginScore[index]) {
      this.state.currentQuestion.score[index] = Number(this.state.currentQuestion.score[index]) + 1 > this.state.currentQuestion.questionOriginScore[index]?
        this.state.currentQuestion.questionOriginScore[index]:Number(this.state.currentQuestion.score[index]) + 1;
      this.setState({
        currentQuestion: this.state.currentQuestion
      })
    }
  },

  togglePanel() {
    this.state.currentQuestion.showPanel = !this.state.currentQuestion.showPanel;
    if (!this.state.currentQuestion.showPanel) {
      correctService.save(function () {
        correctService._calculate();
        this.setData()
      }.bind(this))
    } else {
      this.setState({
        currentQuestion: this.state.currentQuestion
      })
    }
  },

  //下一个批改对象
  getNextItem() {
    correctService.getNextItem(function () {
      this.setData()
    }.bind(this));
  },

  //前一个批改对象
  getPreItem() {
    correctService.getPreItem(function () {
      this.setData()
    }.bind(this));
  },

  //提交批改结果
  submitResult() {
    var _this = this;
    if (this.state.currentQuestion.score == '') {
      if (!correctService.nextStudent) {
        hashHistory.push('/answerList/' + _this.state.exam.exam_id + '/' + _this.state.exam.mark_strategy.is_show_examinee_name)
      } else {
        //跳转下一份作业
        correctService.init(correctService.nextStudent, _this.props.params.type).then((info) => {
          _this.setData()
        })
      }
    } else {
      correctService.submit(function () {
        if (!correctService.nextStudent) {
          hashHistory.push('/answerList/' + _this.state.exam.exam_id + '/' + _this.state.exam.mark_strategy.is_show_examinee_name)
        } else {
          //跳转下一份作业
          correctService.init(correctService.nextStudent, _this.props.params.type).then((info) => {
            _this.setData()
          })
        }
      })
    }
  },

  //批改下一份作业
  getNextStudent() {
    var _this = this;
    if (correctService.nextStudent) {
      correctService.save(function () {
        correctService.init(correctService.nextStudent, _this.props.params.type).then((info) => {
          _this.setData()
        })
      })
    }
  },

  getItem(orderNum) {
    if (this.state.currentQuestion.order_num === orderNum) return;
    correctService.getItem(orderNum, function () {
      this.setData()
    }.bind(this))
  },

  //离开页面时，保存批改结果
  componentWillUnmount() {
    if (correctService.canSaveCorrectInfo()) {
      correctService.save();
    }
  },

  loadUserPhoto() {
    if (this.imgLoadTimes > 3) return
    this.imgNode.src = window.staticUrl + 'auxo/component/js-manual-mark/styles/img/default-avatar.jpg'
    this.imgLoadTimes++
  },

  render() {
    const {formatMessage} = this.props.intl
    if (!this.state.currentQuestion) return <div />

    return (
      <div className='main-correcting main-exam wrapper clearfix'>
        <QuestionCard currentQuestion={this.state.currentQuestion}
            questionItems={this.state.questionItems}
            from={this.props.params.type}
            exam={this.state.exam}
            score={this.state.score}
            onChange={this.getItem} />
        <div className="main-r fr">
          <div className="main-header clearfix">
            {
              !this.state.uc_user_display_facade ? null :
                <div className="stu-info fl">
                  <div className="head-container">
                    <div className="head-mask" />
                    <img src={this.state.uc_user_display_facade ? this.state.uc_user_display_facade.icon : (window.staticUrl + 'auxo/component/js-manual-mark/styles/img/default-avatar.jpg')}
                      ref={imgNode => { this.imgNode = imgNode }}
                      onError={this.loadUserPhoto}
                      style={{ width: '30px', height: '30px' }} />
                  </div>
                  <h3 className="name">{this.state.uc_user_display_facade ? this.state.uc_user_display_facade.nick_name : ''}</h3>
                </div>
            }
            {/* 返回作答列表 */}
            <Link id="selectAll" style={{ textAlign: 'right' }} to={'/answerList/' + this.state.exam.exam_id + '/' + this.state.exam.mark_strategy.is_show_examinee_name}>{formatMessage({id: 'correct.backToList'})}</Link>
          </div>
          <div className="main-content">
            {/* 您已批改 题，还需批改 题 */}
            <p className="system-hint">{formatMessage({id: 'correct.hasMark'})}<i>{this.state.correctedQuestionNum}</i>{formatMessage({id: 'common.excess'})}，{formatMessage({id: 'correct.remainTask'})}<i>{this.state.uncorrectQuestionNum}</i>{formatMessage({id: 'common.excess'})}</p>
            <div className="main-content-question-area">
            {
              this.state.currentQuestion.question.type != 208?
                <QuestionDetail currentQuestion={this.state.currentQuestion}
                                changeScoreValue={this.changeScoreValue}
                                userPaperManualMark={this.state.userPaperManualMark}
                                from={this.props.params.type}
                                minusScore={this.minusScore}
                                addScore={this.addScore}
                                userInfo={this.state.userInfo}
                                selectComment={this.selectComment}
                                changeCommentValue={this.changeCommentValue}
                                togglePanel={this.togglePanel}/>:
                <ComplexQuestionDetail currentQuestion={this.state.currentQuestion}
                                       changeScoreValue={this.changeScoreValue}
                                       userPaperManualMark={this.state.userPaperManualMark}
                                       from={this.props.params.type}
                                       minusScore={this.minusScore}
                                       addScore={this.addScore}
                                       userInfo={this.state.userInfo}
                                       selectComment={this.selectComment}
                                       changeCommentValue={this.changeCommentValue}
                                       togglePanel={this.togglePanel}/>
            }
            </div>
            {/*<div className="btn-choose-question">
              <button className="prev"
                      style={{display:this.state.currentQuestion.order_num !== 1?"":"none"}}
                      onClick={e => this.getPreItem()}>上一题</button>
              <div className="save"
                   style={{background: 'none',display:(!this.state.currentQuestion.showCommitResult && this.state.currentQuestion.lastQuestion)?"":"none"}} />
              <button className="save"
                      style={{display:(!this.state.currentQuestion.showCommitResult && !this.state.currentQuestion.lastQuestion)?"":"none"}}
                      onClick={e => this.getNextItem()}>保存，下一题</button>
              <button className="save"
                      style={{display:this.state.currentQuestion.showCommitResult?"":"none"}}
                      onClick={e => this.submitResult()}>提交批改结果</button>
              <button className="next"
                      style={{display:this.state.currentQuestion.lastQuestion?"":"none"}}
                      onClick={e => this.getNextStudent()}>{this.state.currentQuestion.hasNextStudent?'暂不提交，下一份':'已是最后一份答卷'}</button>
              <button className="next"
                      style={{display:!this.state.currentQuestion.lastQuestion && this.state.currentQuestion.ifAllCorrectedCompleted?"":"none"}}
                      onClick={e => this.getNextItem()}>下一题</button>
            </div>*/}
            <CorrectButtons currentQuestion={this.state.currentQuestion}
              questionItems={this.state.questionItems}
              userPaperManualMark={this.state.userPaperManualMark}
              getPreItem={this.getPreItem}
              getNextItem={this.getNextItem}
              submitResult={this.submitResult}
              getNextStudent={this.getNextStudent} />
          </div>
        </div>
      </div>
    )
  }
})
)
