import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './dialog.scss'
import {injectIntl} from 'react-intl'

/**
 *  目前只有确认框
 **/
@injectIntl
@CSSModules(styles, {allowMultiple: true})
export default class Dialog extends React.Component {
  static propTypes = {
    info: React.PropTypes.string.isRequired,
    onClose: React.PropTypes.func.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
    }
    this.closeHandler = this.closeHandler.bind(this)
  }
  closeHandler() {
    this.props.onClose()
  }
  render() {
    const {formatMessage} = this.props.intl
    return (
      <div styleName="ui-pop">
        <div styleName="pop-content">
          <div styleName="pop-header">
          <span styleName="h-title">
          {formatMessage({id: 'manager.common.dialog.prompt'})}
          </span><span styleName="h-close" id="closeBtn" onClick={this.closeHandler}>X</span>
          </div>
          <div styleName="pop-body">
          <p >{this.props.info}</p>
          </div>
          <div styleName="pop-footer">
          <a styleName="ui-btn" data-style="style01" id="confirm_btn" onClick={this.closeHandler}>
            {formatMessage({id: 'manager.common.dialog.confirm'})}
          </a>
          </div>
        </div>
      </div>
    )
  }
}
