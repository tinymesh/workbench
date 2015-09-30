import React from 'react'

// css is in index.html

export class Loading extends React.Component {
  componentDidMount() {
    window.addEventListener('resize', this._resize = this._resize || this.handleResize.bind(this))
    setTimeout(this._resize, 0) // align first!
  }

  componentDidUpdate() {
    this.handleResize() // align first!
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resize)
  }

  handleResize(ev) {
    // check that loading is not done
    if (!this.refs.loader) {
      window.removeEventListener('resize', this._resize)
      return
    }

    let
      loader = this.refs.loader.getDOMNode(),
      boundryBottom = document.body.getBoundingClientRect().bottom


    //loader.style.marginTop = Math.round(top / 2) + 'px'
    //loader.style.marginLeft = Math.round(left / 2) + 'px'

    loader.style.marginTop = (((boundryBottom - loader.parentElement.getClientRects()[0].top) / 2) - 30) + "px"
    loader.style.marginLeft = ((loader.parentElement.getClientRects()[0].width / 2) - 30) + "px"
  }

  render() {
    let children = this.props.children

    if (typeof(children) === 'string')
      children = <span>{children}</span>
    else if (!children)
      console.log("ERROR: Loading expected String or react element... got: " + typeof(children))

    if (this.props.loading)
      return (
        <div className="loader" ref="loader">
          <div className="square" ></div>
          <div className="square"></div>
          <div className="square last"></div>
          <div className="square clear"></div>
          <div className="square"></div>
          <div className="square last"></div>
          <div className="square clear"></div>
          <div className="square "></div>
          <div className="square last"></div>
        </div>
      )
    else
      return children
  }
}
