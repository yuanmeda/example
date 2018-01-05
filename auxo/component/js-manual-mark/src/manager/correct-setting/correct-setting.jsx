import React, { Component } from 'react'
import classnames from 'classnames'
import CSSModules from 'react-css-modules'
import bootstrap from 'theme/styles/bootstrap/css/bootstrap.min.css'

import styles from './correct-setting.css'
import { getCorrectSettingConfig, postCorrectSettingConfig } from '../../service/rest.service'
import Setting from './setting'

const defaultConfig = {
  mark_strategy: {
    subjective_mark_strategy: 0,
    objective_mark_strategy: 1,
    is_show_examinee_name: true,
    multi_judge_strategy: { type: 0 },
    judge_strategy: { items: [] }
  }
}

@CSSModules(styles, { allowMultiple: true })
export default class extends Component {
  constructor(props) {
    super(props)

    this.state = {
      config: defaultConfig
    }
  }

  componentDidMount() {
    const examId = window.examId || '73dd1853-c885-4c3d-8a36-abc9d84a0513'

    getCorrectSettingConfig(examId)
      .then(config => {
        const newConfig = Object.assign(defaultConfig, config)
        this.setState({
          config: newConfig
        })
      })
  }

  render() {
    const examId = window.examId || '73dd1853-c885-4c3d-8a36-abc9d84a0513'
    const { config } = this.state
    const isFirst = !config.exam_id

    return (
      <div>
        <Setting isFirst={isFirst} onSave={postCorrectSettingConfig} config={config.mark_strategy} />
      </div>
    )
  }
}
