import React from 'react'
import classNames from 'classnames'
import {injectIntl} from 'react-intl'

@injectIntl
class Comment extends React.Component{
  constructor() {
    super()
  }

  selectComment(index, commentIndex) {
    this.props.selectComment(index, commentIndex)
  }

  changeCommentValue(index, e){  //定义输入框value改变的回调函数
    const str = e.target.value
    this.props.changeCommentValue(index, str)
  }

  render() {
    const {formatMessage} = this.props.intl
    const {index} = this.props

    if(!this.props.question) {
      return <div/>
    }

    var commentList = [];
    if(this.props.question.comments) {
      commentList = this.props.question.comments[index].map(function (commentItem, commentIndex) {
        return (
          <button key={commentIndex} className={classNames({"active": commentItem.checked})} onClick={() => { this.selectComment(index, commentIndex) }}>{commentItem.comment}</button>
        )
      }.bind(this))
    }

    const {user_question_manual_mark, commentTextValue} = this.props.question
    return (
      <div className="main-content-comments">
        {
          user_question_manual_mark? "":
            <div>
              {/* 写评语 */}
              <h3 className="comments-tit">{formatMessage({id: 'comment.writeComment'})}<i/></h3>
              <div className="comments-btns">
                {commentList}
              </div>
              <textarea className="comments-print" maxLength="30" placeholder={formatMessage({id: 'comment.inputComment'})} value={commentTextValue[index]} onChange={e => { this.changeCommentValue(index, e) }}/>
            </div>
        }
        <div style={{display: user_question_manual_mark && user_question_manual_mark.remark ? "" : "none"}}>
          {/* 评语 */}
          <h3 className="comments-tit">{formatMessage({id: 'comment'})}<i/></h3>
          <p className="comments-final">
            {user_question_manual_mark ? user_question_manual_mark.subs[index].remark : ''}
          </p>
        </div>
      </div>
    )
  }
}

export default Comment
