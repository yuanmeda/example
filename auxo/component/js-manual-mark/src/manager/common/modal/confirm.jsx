import React from 'react'

import Modal from './modal'

export default ({title = '确认', onClose, onOk, show, msg, cancelTxt='取消', okTxt='确认'}) => (
  <Modal clsName="confirm" title={title} show={show} onClose={onClose}>
    {msg}
    <div styleName="modal-operations">
      <button onClick={onClose} styleName="btn btn-cancel">{cancelTxt}</button>
      <button onClick={onOk} styleName="btn btn-ok">{okTxt}</button>
    </div>
  </Modal>
)
