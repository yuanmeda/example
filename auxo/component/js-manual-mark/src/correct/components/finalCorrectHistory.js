/**
 * Created by Administrator on 2017/6/25 0025.
 */

import React from 'react';
import {injectIntl} from 'react-intl'

@injectIntl
class FinalCorrectHistory extends React.Component{
  constructor(props) {
    super(props)
  }

  render() {
    const {question, intl, index} = this.props
    const {formatMessage} = intl
    if(!question) {
      return <div />
    }

    const historyList = this.props.question.batchCorrectInfo.map(function (item, itemIndex) {
      return (
        <div key={itemIndex} className="score-members">
          {/* 批改员： */}
          <p><label>{formatMessage({id: 'correct.corrector'})}：</label>{item.uc_user_display_facade.nick_name}</p>
          {
            // 打分
            item.user_question_mark ?
              <p><label>{formatMessage({id: 'correct.mark'})}：</label>{item.user_question_mark.subs[index].score}</p> :
              formatMessage({id: 'correct.unCorrect'})
              // 未批改
          }
          {
            // 评语：
            // 暂无评语
            item.user_question_mark ?
              <p><label>{formatMessage({id: 'comment'})}：</label>{item.user_question_mark.subs[index].remark ? item.user_question_mark.subs[index].remark: formatMessage({id: 'correct.noComment'})}</p> :
              null
          }

        </div>      )
    }.bind(this))

    return (
      <div>
        {historyList}
      </div>
    )
  }
}

export default FinalCorrectHistory

