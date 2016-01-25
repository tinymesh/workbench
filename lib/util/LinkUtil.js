import _ from 'lodash'

let LinkUtil = {
  mapPath: (ctx, path) => {
    if (!ctx.props.params)
      throw Error("this.props.params not found... aborting")

    let params = ctx.props.params

    path = _.isArray(path) ? path.join('/') : path
    return ('/' + _.trim(path, '/'))
            .replace(/\/:([a-zA-Z0-9_-]*)/g, (match, k) => '/' + params[k])
  },

  path: (ctx, path) => {
    if (!ctx.props.routes)
      throw Error("this.props.routes not found... aborting")


    let routable
    switch (path[0] + path[1]) {
      case '/' + path[1]:
        return LinkUtil.mapPath(ctx, path)

      case './': // replace last component
        routable = _.reduce(ctx.props.routes.slice(0, -1),
                                (acc, route, index) => acc += '/' + _.trim(route.path, '/'),
                                '')
        return LinkUtil.mapPath(ctx, routable + '/' + path)

      default: // append
        routable = _.reduce(ctx.props.routes,
                                (acc, route, index) => acc += '/' + _.trim(route.path, '/'),
                                '')

        return LinkUtil.mapPath(ctx, '/' === path[0] ? path : (routable + '/' + path))
    }
  }
}

export {LinkUtil}
