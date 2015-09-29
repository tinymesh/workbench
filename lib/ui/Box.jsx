import React from 'react'
import {Alert} from 'react-bootstrap'

import _ from 'lodash'

class Title extends React.Component {
  render() {
    return (
      <div className={(this.props.className || "") + " box-title"}>
        <h4>{this.props.children}</h4>
      </div>
    )
  }
}

class Notify extends React.Component {
  render() {
    return (
      <div className={(this.props.className || "") + " box-notify"}>
        <Alert bsStyle={this.props.style}>{ this.props.children }</Alert>
      </div>
    )
  }
}

class Content extends React.Component {
  render() {
    return (
      <div className={(this.props.className || "") + " box-content"}>

        { this.props.children }
      </div>
    )
  }
}

class Info extends React.Component {
  render() {
    return (
      <div className={(this.props.className || "") + " box-info"}>

        { this.props.children }
      </div>
    )
  }
}

export class Box extends React.Component {
  render() {
    let show = undefined === this.props.show ? true : !!this.props.show

    if (show)
      return (
        <div
          className={(this.props.className || "") + " box"}>

          { this.props.children }
        </div>
      )
    else
      return null
  }
}

Box.Title = Title
Box.Notify = Notify
Box.Content = Content
Box.Info = Info
