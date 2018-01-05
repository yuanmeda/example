import React from 'react'
import $script from 'scriptjs'
import{ injectIntl} from 'react-intl'

$script('src/static/plugin/js/My97DatePicker/WdatePicker.js')

@injectIntl
class DatePicker extends React.Component {
  static propTypes = {
    id: React.PropTypes.string,
    dateFmt: React.PropTypes.string,
    onChange: React.PropTypes.func
  }

  constructor() {
    super()
    this.onChange = this.onChange.bind(this)
  }

  onChange() {
    this.props.onChange(this.inputComp.value)
  }

  render() {
    const {id, dateFmt, intl: {formatMessage}} = this.props
    return (
      <div className='select-box-date clearfix'>
        <input ref={inputComp => { this.inputComp = inputComp }}
               id={id}
               className='date-picker'
               type='text'
               onClick={() => { WdatePicker({el: id, dateFmt: dateFmt || 'yyyy-MM-dd HH:mm', onpicked: this.onChange}) }}
               // 请选择时间
               placeholder={formatMessage({id: 'datepicker.selectTime'})} />
        <button onClick={() => { WdatePicker({el: id, onpicked: this.onChange}) }} />
      </div>
    )
  }
}

export default DatePicker
