import React from 'react'
import moment from 'moment'
import classNames from 'classnames'
import {injectIntl} from 'react-intl'

@injectIntl
export default class QuestionCard extends React.Component {
  static propTypes = {
    onChange: React.PropTypes.func,
    currentQuestion: React.PropTypes.object,
    questionItems: React.PropTypes.array,
    exam: React.PropTypes.object,
    score: React.PropTypes.number,
    from: React.PropTypes.string
  }

  render() {
    const {currentQuestion, questionItems, onChange, exam, score, from} = this.props
    const {formatMessage} = this.props.intl
    if (!currentQuestion || !questionItems || !questionItems.length || !exam) return <div />
    const {name, start_time, end_time} = exam
    return (
      <div className='main-l fl'>
        <div className='main-l-title'>
          <h2>{name}</h2>
        </div>
        <div className='main-l-content'>
          <div className='main-l-content-side'>
            {/* 题数 */}
            <label>{formatMessage({id: 'question.questionNum'})}：</label>
            <span>{questionItems.length}</span>
          </div>
          <div className='main-l-content-side'>
            {/* 考试时间 */}
            <label>{formatMessage({id: 'question.examTime'})}：</label>
            <br />
            <span className='date'>
              {formatMessage({id: 'question.examTimeRange'}, {startTime: moment(start_time).format('YYYY-MM-DD HH:mm:ss'), endTime: moment(end_time).format('YYYY-MM-DD HH:mm:ss')})}
              {/* { `${moment(start_time).format('YYYY-MM-DD HH:mm:ss')}至${moment(end_time).format('YYYY-MM-DD HH:mm:ss')}`} */}
            </span>
          </div>
          {
            from === 'review' ?
              <div className='main-l-content-side'>
                {/* 总分 */}
                <label>{formatMessage({id: 'question.totalScore'})}：</label>
                <span>{score}</span>
              </div>
              : null
          }
          <div className='main-l-content-side'>
            {/* 试题列表 */}
            <label>{formatMessage({id: 'question.list'})}：</label>
            <ul className='questions-list'>
              {
                questionItems.map((item, index) => {
                  return <li key={index}>
                    <a className={classNames({'checked': item.user_question_manual_mark, 'active': item.order_num === currentQuestion.order_num})}
                       href='javascript:'
                       onClick={() => { onChange(item.order_num) }}>{item.order_num}</a>
                  </li>
                })
              }
            </ul>
          </div>
        </div>
      </div>
    )
  }
}
