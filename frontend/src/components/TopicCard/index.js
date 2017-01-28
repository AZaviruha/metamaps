import React, { PropTypes, Component } from 'react'

import Title from './Title'
import Links from './Links'
import Desc from './Desc'
import Attachments from './Attachments'

class ReactTopicCard extends Component {
  render = () => {
    const { topic, ActiveMapper } = this.props
    var authorizedToEdit = topic.authorizeToEdit(ActiveMapper)
    const hasAttachment = topic.get('link') && topic.get('link') !== ''
    const topicId = topic.isNew() ? topic.cid : topic.id // TODO should we be using cid here???

    let classname = 'permission'
    if (authorizedToEdit) {
      classname += ' canEdit'
    } else {
      classname += ' cannotEdit'
    }
    if (topic.authorizePermissionChange(ActiveMapper)) classname += ' yourTopic'

    return (
      <div className={classname}>
        <div className={`CardOnGraph ${hasAttachment ? 'hasAttachment' : ''}`} id={`topic_${topicId}`}>
          <Title name={topic.get('name')}
            onChange={this.props.updateTopic}
            authorizedToEdit={topic.authorizeToEdit(ActiveMapper)}
          />
          <Links topic={topic}
            ActiveMapper={this.props.ActiveMapper}
            updateTopic={this.props.updateTopic}
          />
          <Desc desc={topic.get('desc')}
            authorizedToEdit={topic.authorizeToEdit(ActiveMapper)}
            onChange={this.props.updateTopic}
          />
          <Attachments topic={this.props.topic}
            ActiveMapper={this.props.ActiveMapper}
            updateTopic={this.props.updateTopic}
          />
          <div className="clearfloat"></div>
        </div>
      </div>
    )
  }
}

ReactTopicCard.propTypes = {
  topic: PropTypes.object,
  ActiveMapper: PropTypes.object,
  updateTopic: PropTypes.func
}

export default ReactTopicCard
