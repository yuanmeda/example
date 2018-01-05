import React, { Component } from 'react'
import classnames from 'classnames'
import CSSModules from 'react-css-modules'

import styles from './selection.css'

@CSSModules(styles, { allowMultiple: true })
class Selection extends Component {
  constructor(props) {
    super(props)

    const { options, value, placeholder } = props
    const selectedOpt = options.find(opt => opt.value === value) || {value: undefined, text: placeholder}

    this.state = {
      showOptions: false,
      selectedText: selectedOpt.text,
      selectedValue: value,
      hover: false,
      hoverValue: selectedOpt.value,
      hoverSelectContainer: false,
      hoverSelectList: false
    }

    this.renderOptions = this.renderOptions.bind(this)
    this.toggleOptions = this.toggleOptions.bind(this)
    this.clickOptionHandler = this.clickOptionHandler.bind(this)
    this.hoverOption = this.hoverOption.bind(this)
    this.moveLeaveSelect = this.moveLeaveSelect.bind(this)
    this.moveOnSelect = this.moveOnSelect.bind(this)
    this.mouseOverSelectList = this.mouseOverSelectList.bind(this)
    this.mouseOutSelectList = this.mouseOutSelectList.bind(this)
    this.setShowOptions = this.setShowOptions.bind(this)
  }

  componentWillReceiveProps(props) {
    const newState = {}
    const { options, value, placeholder } = props
    const selectedOpt = options.find(opt => opt.value === value) || {value: undefined, text: placeholder}

    newState.selectedValue = value
    newState.selectedText = selectedOpt.text
    newState.hoverValue = selectedOpt.value

    this.setState(newState)
  }

  toggleOptions() {
    const {showOptions} = this.state

    this.setState({
      showOptions: !showOptions
    })
  }

  clickOptionHandler(event, item) {
    // todo 选择选项
    const {selectedValue} = this.state

    if(item.value === selectedValue) {
      return this.setState({
        showOptions: false
      })
    }

    this.setState({
      selectedText: item.text,
      selectedValue: item.value,
      showOptions: false
    }, () => {
      const {onChange} = this.props
      const id = (event.target || event.srcElement).parentNode.id
      item.id = id

      onChange && onChange(item)
    })
  }

  hoverOption(hoverValue) {
    this.setState({
      hoverValue
    })
  }

  moveOnSelect() {
    this.setState({
      hover: true,
      hoverSelectContainer: true
    }, this.setShowOptions)
  }

  moveLeaveSelect() {
    this.setState({
      hover: false,
      hoverSelectContainer: false
    }, this.setShowOptions)
  }

  mouseOverSelectList() {
    this.setState({
      hoverSelectList: true
    }, this.setShowOptions)
  }

  mouseOutSelectList() {
    this.setState({
      hoverSelectList: false
    }, this.setShowOptions)
  }

  setShowOptions() {
    const {showOptions, hoverSelectContainer, hoverSelectList} = this.state
    if(showOptions && !hoverSelectContainer && !hoverSelectList) {
      this.setState({
        showOptions: false
      })
    }
  }

  renderOptions() {
    const { options, id } = this.props
    const { showOptions, hoverValue} = this.state
    const optsCls = classnames({
      'select-opts': true,
      'show': showOptions
    })

    return (
      <ul id={id} styleName={optsCls} style={{top: '70%'}} onMouseLeave={this.mouseOutSelectList}>
        {
          options.map((option, i) => {
            const itemCls = classnames({
              'select-opt-item': true,
              'selected': hoverValue === option.value
            })

            return (
              <li onMouseEnter={() => {this.hoverOption(option.value)}} onClick={() => {this.clickOptionHandler(event, option)}} styleName={itemCls} key={i} data-value={option.value} >{option.text}</li>
            )
          })
        }
      </ul>
    )
  }

  render() {
    const { selectedText, showOptions, hover } = this.state
    const { value, placeholder } = this.props
    const labelCls = classnames({
      'select-label': true,
      'placeholder': selectedText === placeholder && value === undefined
    })
    const iconCls = classnames({
      'icon-hover': hover,
      'select-up': showOptions
    })

    return (
      <div onMouseEnter={this.moveOnSelect} onMouseLeave={this.moveLeaveSelect} styleName="select" style={{height: '50px'}}>
        <div onClick={this.toggleOptions} styleName={labelCls}>
          <span>{selectedText}</span>
          <span styleName="separate"/>
          <i styleName={iconCls} className="icon select-down"/>
        </div>
        {this.renderOptions()}
      </div>
    )
  }
}

Selection.propType = {
  onChange: React.PropTypes.func,
  options: React.PropTypes.arrayOf(React.PropTypes.object),
  placeholder: React.PropTypes.string,
  value: React.PropTypes.string
}

export default Selection




