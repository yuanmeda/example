import React from 'react'
import {injectIntl} from 'react-intl'
import classNames from 'classnames'

@injectIntl
export default class CorrectButtons extends React.Component{
  constructor() {
    super()
  }

  render() {
    const {formatMessage} = this.props.intl
    const {currentQuestion, questionItems, userPaperManualMark, getPreItem, getNextItem, submitResult, getNextStudent} = this.props
    return (
      userPaperManualMark.status !== 2 ?
      <div className="btn-choose-question">
        {/* 上一题 */}
        <button className="prev"
                style={{display:currentQuestion.order_num !== 1?"":"none"}}
                onClick={() => { getPreItem() }}>{formatMessage({id: 'correctBtn.prev'})}</button>
        <div className="save"
             style={{background: 'none',display:(!currentQuestion.showCommitResult && currentQuestion.lastQuestion)?"":"none"}} />
             {/* 保存，下一题 */}
        <button className="save"
                style={{display:(!currentQuestion.showCommitResult && !currentQuestion.lastQuestion)?"":"none"}}
                onClick={() => { getNextItem() }}>{formatMessage({id: 'correctBtn.saveAndNext'})}</button>
                {/* 提交批改结果 */}
        <button className="save"
                style={{display:currentQuestion.showCommitResult?"":"none"}}
                onClick={() => { submitResult() }}>{formatMessage({id: 'correctBtn.save'})}</button>
                {/* 暂不提交，下一份 ： 已是最后一份答卷 */}
        <button className={classNames('next', { 'last': !currentQuestion.hasNextStudent})}
                style={{display:currentQuestion.lastQuestion?"":"none"}}
                onClick={() => { getNextStudent() }}>{currentQuestion.hasNextStudent? formatMessage({id: 'correctBtn.noSaveAndNext'}) : formatMessage({id: 'correctBtn.alreadyLast'})}</button>
                {/* 下一题 */}
        <button className="next"
                style={{display:!currentQuestion.lastQuestion && currentQuestion.ifAllCorrectedCompleted?"":"none"}}
                onClick={() => { getNextItem() }}>{formatMessage({id: 'correctBtn.next'})}</button>
      </div>
      :
      <div className="btn-choose-question">
        {/* 上一题 */}
        <button className="save"
                style={{display:currentQuestion.order_num !== 1?"":"none"}}
                onClick={() => { getPreItem() }}>{formatMessage({id: 'correctBtn.prev'})}</button>
        <div className="save"
             style={{background: 'none',display:(questionItems&&questionItems.length===1)?"":"none"}} />
        {questionItems&&questionItems.length>2?<span>{'   '}</span>:null}
        {/* 下一题 */}
        <button className="save"
                style={{display:!currentQuestion.lastQuestion?"":"none"}}
                onClick={() => { getNextItem() }}>{formatMessage({id: 'correctBtn.next'})}</button>
                {/* 下一份:已是最后一份答卷 */}
        <button className={classNames('next', { 'last': !currentQuestion.hasNextStudent})}
                style={{display:currentQuestion.lastQuestion?"":"none"}}
                onClick={() => { getNextStudent() }}>{currentQuestion.hasNextStudent? formatMessage({id: 'correctBtn.nextExam'}) : formatMessage({id: 'correctBtn.alreadyLast'})}</button>
      </div>
    )
  }
}
