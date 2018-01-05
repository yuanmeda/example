import React from 'react'
import DatePicker from './common/datePicker'

export default class Log extends React.Component {
  constructor() {
    super()
    this.state = {}
    this.listParams = {
      startDate: '',
      endDate: '',
      keyword: ''
    }
    this.startDateChange = this.startDateChange.bind(this)
    this.endDateChange = this.endDateChange.bind(this)
    this.onSearchChange = this.onSearchChange.bind(this)
  }

  startDateChange(date) {
    this.listParams.startDate = date
  }

  endDateChange(date) {
    this.listParams.endDate = date
  }

  onSearchChange(e) {
    this.listParams.keyword = e.target.value
  }

  render() {
    return (
      <div className='main-correcting wrapper clearfix'>
        <div className='main-r fr'>
          <div className='main-header clearfix'>
            <h2 className='main-header-tit fl'>批改日志</h2>
            <a className='btn-back fr' href='javascript:'>返回</a>
          </div>
          <div className='main-content'>
            <div className='filter-bar clearfix'>
              <div className='filter-bar-l fl'>
                <label>批改时间：</label>
                <DatePicker id='startDate' onChange={this.startDateChange} />
                <label className='connect-line'>—</label>
                <DatePicker id='endDate' onChange={this.endDateChange} />
              </div>
              <div className='filter-bar-r fr'>
                <div className='search-box'>
                  <input type='text' placeholder='输入考试名称、考生姓名搜索' onChange={this.onSearchChange} />
                  <button />
                </div>
              </div>
            </div>
            <table className='correct-table'>
              <thead>
                <tr>
                  <th width='20%'>考试名称</th>
                  <th width='20%'>考试时间</th>
                  <th width='9%'>批改人</th>
                  <th width='9%'>考生姓名</th>
                  <th width='9%'>批改题号</th>
                  <th>批改时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>方法论N49期考试</td>
                  <td>2016-05-13 00:00 至2016-05-15 20:00</td>
                  <td>ACA</td>
                  <td>王某某</td>
                  <td>1</td>
                  <td>2016-05-13 00:00</td>
                  <td><a className='btn-operate'>查看</a></td>
                </tr>
                <tr>
                  <td>方法论N49期考试</td>
                  <td>2016-05-13 00:00 至2016-05-15 20:00</td>
                  <td>ACA</td>
                  <td>王某某</td>
                  <td>1</td>
                  <td>2016-05-13 00:00</td>
                  <td><a className='btn-operate'>查看</a></td>
                </tr>
                <tr>
                  <td>方法论N49期考试</td>
                  <td>2016-05-13 00:00 至2016-05-15 20:00</td>
                  <td>ACA</td>
                  <td>王某某</td>
                  <td>1</td>
                  <td>2016-05-13 00:00</td>
                  <td>
                    <a className='btn-operate'>查看</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
}
