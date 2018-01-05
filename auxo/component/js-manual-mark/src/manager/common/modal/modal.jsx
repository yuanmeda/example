import React from 'react'
import CSSModules from 'react-css-modules'
import classnames from 'classnames'

import styles from './modal.css'

const Modal = ({ clsName, title, show, children, onClose }) => {
  const cls = classnames({
    wrap: true,
    hide: !show
  })

  return (
    <div styleName={cls}>
      <div styleName={`modal ${clsName}`}>
        <div styleName="modal-header">
          <span styleName="modal-title">{title}</span>
          <span onClick={onClose} styleName="modal-close">X</span>
        </div>
        <div styleName="modal-content">
          {children}
        </div>
      </div>
    </div>
  )
}

Modal.protoType = {
  title: React.PropTypes.string,
  show: React.PropTypes.bool.isRequired,
  children: React.PropTypes.element,
  onClose: React.PropTypes.func.isRequired,
  clsName: React.PropTypes.string
}

export default CSSModules(styles, { allowMultiple: true })(Modal)
