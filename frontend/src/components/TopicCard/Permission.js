import React, { PropTypes, Component } from 'react'

// TODO how do we make it so that clicking elsewhere on the topic
// card cancels this
class Permission extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selectingPermission: false
    }
  }

  togglePermissionSelect = () => {
    this.setState({selectingPermission: !this.state.selectingPermission})
  }

  openPermissionSelect = () => {
    this.setState({selectingPermission: true})
  }

  closePermissionSelect = () => {
    this.setState({selectingPermission: false})
  }

  render = () => {
    const self = this
    const { topic, ActiveMapper, updateTopic } = this.props
    const { selectingPermission } = this.state
    const permission = topic.get('permission')
    const canChange = topic.authorizePermissionChange(ActiveMapper)
    const onClick = canChange ? this.togglePermissionSelect : () => {}
    let classes = `linkItem mapPerm ${permission.substring(0, 2)}`
    if (selectingPermission) classes += ' minimize'
    const liClick = value => {
      return event => {
        self.closePermissionSelect()
        updateTopic({
          permission: value,
          defer_to_map_id: null
        })
        // prevents it from also firing the event listener on the parent
        event.preventDefault()
      }
    }
    const selectCommons = <li key='1' className='commons' onClick={liClick('commons')}></li>
    const selectPublic = <li key='2' className='public' onClick={liClick('public')}></li>
    const selectPrivate = <li key='3' className='private' onClick={liClick('private')}></li>
    let permOptions
    if (permission === 'commons') {
      permOptions = [selectPublic, selectPrivate]
    } else if (permission === 'public') {
      permOptions = [selectCommons, selectPrivate]
    } else if (permission === 'private') {
      permOptions = [selectCommons, selectPublic]
    }

    return (
      <div
          className={classes}
          title={permission}
          onClick={onClick}>
        {selectingPermission && <ul className="permissionSelect">
          {permOptions}
        </ul>}
      </div>
    )
  }
}

Permission.propTypes = {
  topic: PropTypes.object, // backbone object
  ActiveMapper: PropTypes.object,
  updateTopic: PropTypes.func
}

export default Permission
