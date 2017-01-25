import React from 'react'

const inmaps = (topic) => {
  const inmapsArray = topic.get('inmaps') || []
  const inmapsLinks = topic.get('inmapsLinks') || []

  let html = ''
  if (inmapsArray.length < 6) {
    for (let i = 0; i < inmapsArray.length; i++) {
      const url = '/maps/' + inmapsLinks[i]
      html += '<li><a href="' + url + '">' + inmapsArray[i] + '</a></li>'
    }
  } else {
    for (let i = 0; i < 5; i++) {
      const url = '/maps/' + inmapsLinks[i]
      html += '<li><a href="' + url + '">' + inmapsArray[i] + '</a></li>'
    }
    const extra = inmapsArray.length - 5
    html += '<li><span class="showMore">See ' + extra + ' more...</span></li>'
    for (let i = 5; i < inmapsArray.length; i++) {
      const url = '/maps/' + inmapsLinks[i]
      html += '<li class="hideExtra extraText"><a href="' + url + '">' + inmapsArray[i] + '</a></li>'
    }
  }

  return html
}

const Links = (props) => {
  const { topic } = props
  const topicId = topic.isNew() ? topic.cid : topic.id // TODO should we really be using cid here?!?
  const permission = topic.get('permission')
  // the code for this is stored in /views/main/_metacodeOptions.html.erb
  const metacodeSelectHTML = $('#metacodeOptions').html()

  return (
		<div className="links">
			<div className="linkItem icon">
				<div className={`metacodeTitle mbg${topic.get('metacode_id')}`}>
					{topic.getMetacode().get('name')}
					<div className="expandMetacodeSelect"></div>
				</div>
				<div className="metacodeImage" style={{backgroundImage: `url(${topic.getMetacode().get('icon')})`}} title="click and drag to move card"></div>
        <div className="metacodeSelect" dangerouslySetInnerHTML={{ __html: metacodeSelectHTML }} />
			</div>
			<div className="linkItem contributor">
				<a href={`/explore/mapper/${topic.get('user_id')}`} target="_blank"><img src={topic.get('user_image')} className="contributorIcon" width="32" height="32" /></a>
				<div className="contributorName">{topic.get('user_name')}</div>
			</div>
			<div className="linkItem mapCount">
				<div className="mapCountIcon"></div>
				{topic.get('map_count').toString()}
				<div className="hoverTip">Click to see which maps topic appears on</div>
				<div className="tip"><ul>{inmaps(props.topic)}</ul></div>
			</div>
			<a href={`/topics/${topicId}`} target="_blank" className="linkItem synapseCount">
				<div className="synapseCountIcon"></div>
				{topic.get('synapse_count').toString()}
				<div className="tip">Click to see this topics synapses</div>
			</a>
			<div className={`linkItem mapPerm ${permission.substring(0, 2)}`} title={permission}></div>
			<div className="clearfloat"></div>
		</div>
  )
}

/*
 * Links.propTypes = {
 *   topic: PropTypes.object, // backbone object
 * }
 */

export default Links
