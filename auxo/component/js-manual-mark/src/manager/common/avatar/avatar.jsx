import React from 'react'
import defaultAvatar from "../../../../styles/img/default-avatar.jpg"
import config from '../../../service/request-config'

export default class Avatar extends React.Component {
  static propTypes = {
    userId: React.PropTypes.number.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      imageUrl: [config.avatar_host, "/avatar/", this.props.userId, "/", this.props.userId, ".jpg?size=80"].join('')
    }
  }
  onError() {
    this.setState({
      imageUrl: defaultAvatar
    })
  }
  render() {
    return (
      <img onError={this.onError.bind(this)} src={this.state.imageUrl} />
    )
  }
}
