import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './dataNone.css'

@CSSModules(styles, {allowMultiple: true})
export default class DataNone extends React.Component {
  render() {
    return (
      <div styleName="empty-tips">
        <i styleName="empty-tips-icon"/>
        <div styleName="tips-txt">{this.props.text}</div>
      </div>
    )
  }
}

