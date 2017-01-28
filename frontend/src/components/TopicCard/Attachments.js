/* global $, CanvasLoader, Countable, Hogan, embedly */
import React, { PropTypes, Component } from 'react'

class Attachments extends Component {
  constructor(props) {
    super(props)

    this.state = {
      linkEdit: '',
      embedlyLinkError: false,
      embedlyLinkStarted: false,
      embedlyLinkLoaded: false
    }
  }

  componentDidMount = () => {
    const { topic, ActiveMapper } = this.props
    embedly('on', 'card.rendered', this.embedlyCardRendered)
    topic.get('link') && topic.get('link') !== '' && this.loadLink()
  }

  componentWillUnmount = () => {
    embedly('off')
  }

  componentDidUpdate = () => {
    const { topic } = this.props
    const { embedlyLinkStarted } = this.state
    !embedlyLinkStarted && topic.get('link') && topic.get('link') !== '' && this.loadLink()
  }

  embedlyCardRendered = (iframe, test) => {
    this.setState({embedlyLinkLoaded: true, embedlyLinkError: false})
  }

  resetLinkInput = () => {
    this.setState({ linkEdit: '' })
    this.linkInput.focus()
  }

  onLinkChangeHandler = e => {
    this.setState({ linkEdit: e.target.value })
  }

  onLinkKeyUpHandler = e => {
    const { linkEdit } = this.state
    let finalLink
    const ENTER_KEY = 13
    if (e.which === ENTER_KEY) {
      // TODO evaluate converting this to '//' no matter what (infer protocol)
      if (linkEdit.slice(0, 7) !== 'http://' &&
      linkEdit.slice(0, 8) !== 'https://' &&
      linkEdit.slice(0, 2) !== '//') {
        finalLink = '//' + linkEdit
      }
      this.setState({ linkEdit: '' })
      this.props.updateTopic({ link: finalLink })
    }
  }

  loadLink = () => {
    this.setState({embedlyLinkStarted: true})
    var e = embedly('card', document.getElementById('embedlyLink'))
    if (e && e.type === 'error') this.setState({embedlyLinkError: true})
  }

  removeLink = () => {
    this.setState({
      embedlyLinkStarted: false,
      embedlyLinkLoaded: false,
      embedlyLinkError: false
    })
    this.props.updateTopic({ link: null })
  }

  render = () => {
    const { topic, ActiveMapper } = this.props
    const { linkEdit, embedlyLinkLoaded, embedlyLinkStarted, embedlyLinkError } = this.state

    const authorizedToEdit = topic.authorizeToEdit(ActiveMapper)
    const hasAttachment = topic.get('link') && topic.get('link') !== ''

    if (!hasAttachment && !authorizedToEdit) return null

    const className = hasAttachment
      ? `embeds ${embedlyLinkLoaded ? '' : 'nonEmbedlyLink'}`
      : 'attachments'

    return (
      <div className={className}>
        <div className="addLink"
          style={{ display: hasAttachment ? 'none' : 'block' }}
        >
          <div id="addLinkIcon"></div>
          <div id="addLinkInput">
            <input ref={input => this.linkInput = input}
              placeholder="Enter or paste a link"
              value={linkEdit}
              onChange={this.onLinkChangeHandler}
              onKeyUp={this.onLinkKeyUpHandler}></input>
            {linkEdit && <div id="addLinkReset"></div>}
          </div>
        </div>
        <a style={{ display: hasAttachment ? 'block' : 'none' }} 
          href={topic.get('link')}
          id="embedlyLink"
          target="_blank"
          data-card-description="0"
        >
          {topic.get('link')}
        </a>
        {embedlyLinkStarted && !embedlyLinkLoaded && !embedlyLinkError && <div id="embedlyLinkLoader">loading...</div>}
        {authorizedToEdit && (
          <div id="linkremove"
            style={{ display: hasAttachment ? 'block' : 'none' }}
            onClick={this.removeLink}
          />
        )}
      </div>
    )
  }
}

Attachments.propTypes = {
  topic: PropTypes.object,
  ActiveMapper: PropTypes.object,
  updateTopic: PropTypes.func
}

export default Attachments
