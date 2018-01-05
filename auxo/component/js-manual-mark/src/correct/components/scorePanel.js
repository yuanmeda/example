import React from 'react';
import moment from 'moment';
import {injectIntl} from 'react-intl'

@injectIntl
class ScorePanel extends React.Component{
  constructor(props) {
    super(props)
    this.minusScore = this.minusScore.bind(this)
    this.changeScoreValue = this.changeScoreValue.bind(this)
    this.togglePanel = this.togglePanel.bind(this)
  }

  minusScore() {
    this.props.minusScore(this.props.index)
  }

  addScore(){
    this.props.addScore(this.props.index)
  }

  changeScoreValue(e) {
    let val = e.target.value
    if (!/^[0-9]*$/.test(val)) {
      val = 0
    }
    if (val > this.props.question.questionOriginScore[this.props.index]) {
      val = this.props.question.questionOriginScore[this.props.index]
    }
    this.props.changeScoreValue(val, this.props.index)
  }

  togglePanel() {
    this.props.togglePanel()
  }

  render() {
    const {question, userPaperManualMark, index, intl} = this.props
    const {formatMessage} = intl
    if(!question) {
      return <div />
    }
    return (
      <div className="score-area">
        {/* 本题分数： */}
        <p className="total-score"><i className="color-light-grey">{formatMessage({id: 'scorePane.score'})}：</i> {question.questionOriginScore[index]}</p>
        {
          question.showAverage?
            <p className="total-score">
              <i className="color-light-grey">
                {/* N位批改员平均分 */}
                {/* 最高分 */}
                {/* 最低分 */}
                {
                  formatMessage({id: 'scorePane.avgScore'}, {num: this.props.question.batchCorrectInfo.length})
                }{question.averageScore[index]},
                {formatMessage({id: 'scorePane.maxScore'})}{question.finalScoreShow[index][question.finalScoreShow[index].length - 1]},
                {formatMessage({id: 'scorePane.minScore'})}{question.finalScoreShow[index][0]}
                {/* {this.props.question.batchCorrectInfo.length}位批改员平均分：{question.averageScore}，最高分：{question.highestScore}，最低分:{question.lowestScore} */}
              </i>
            </p>:null
        }
        <div className="tc-score">
          {/* 您的打分： */}
          <i className="color-orange">{formatMessage({id: 'scorePane.yourScore'})}：</i>
          <div className="jj-input" style={{display: (!question.user_question_manual_mark || question.showPanel) ? "" : "none"}}>
            <span className="jian" onClick={() => { this.minusScore() }}/>
            <input className="color-orange"
                   value={question.score[index]}
                   onChange={e => { this.changeScoreValue(e) }}
                   type="text"/>
            <span className="jia" onClick={() => { this.addScore() }}/>
          </div>
          <i className="final-score color-orange"
             style={{display: (question.user_question_manual_mark && !question.showPanel) ? "" : "none"}}>
            {question.score[index] ? question.score[index] : 0}{formatMessage({id: 'common.score'})}
          </i>
          {
            userPaperManualMark.status === 2
            ? null
            : <a className="link"
               style={{display: question.user_question_manual_mark ? "" : "none", marginLeft: '10px'}}
               onClick={() => {
                 this.togglePanel()
               }}>{question.showPanel ? formatMessage({id: 'common.ok'}) : formatMessage({id: 'common.edit'})}
               {/* 确定 ： 修改 */}
              </a>
          }
          <ul>
            {
              question.history && question.history.length ?
                question.history.map((item, indexItem) => {
                  return <li key={indexItem}>
                      <span className="last-score">
                        {moment(item.create_time).format('YYYY-MM-DD HH:mm') +  '  ' + formatMessage({id: 'correct.mark'}) + ':'}
                        <i>{item.subs[index].score}</i>{formatMessage({id: 'common.score'})}
                      </span>
                  </li>
                }) : null
            }
          </ul>
        </div>
      </div>
    )
  }
}

export default ScorePanel
