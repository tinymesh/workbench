import React from 'react'

class Title extends React.Component {
  render() {
    return ( <h4 style={{display: 'inline'}} className="title">{this.props.children}</h4> )
  }
}

class ItemDate extends React.Component {
  render() {
    return ( <span className="pull-right date">{this.props.date.toString()}</span> )
  }
}

class Content extends React.Component {
  render() {
    return ( <p>{this.props.children}</p> )
  }
}

export class TaggedItem extends React.Component {
  render() {
    return (
      <div className={"tagged-item " + (this.props.className || "")}>
        <div className={"item item-" + this.props.tagStyle || 'default'}>
          {this.props.children}
         </div>
      </div>
    )
  }
}

TaggedItem.Title = Title
TaggedItem.Date = ItemDate
TaggedItem.Content = Content
