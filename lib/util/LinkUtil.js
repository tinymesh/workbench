import _ from 'lodash'

let LinkUtil = {
  mapPath: (ctx, path, params) => {
    if (!ctx.props.params)
      throw Error("this.props.params not found... aborting")

    params = _.merge(ctx.props.params, params)

    path = _.isArray(path) ? path.join('/') : path
    return ('/' + _.trim(path, '/'))
            .replace(/\/:([a-zA-Z0-9_-]*)/g, (match, k) => '/' + params[k])
  },

  path: (ctx, path, params) => {
    if (!ctx.props.routes)
      throw Error("this.props.routes not found... aborting")


    let routable
    switch (path[0] + path[1]) {
      case '/' + path[1]:
        return LinkUtil.mapPath(ctx, path, params)

      case './': // replace this component
        routable = _.reduce(ctx.props.routes.slice(0, -1),
                                (acc, route, index) => acc += '/' + _.trim(route.path, '/'),
                                '')
        return LinkUtil.mapPath(ctx, routable + '/' + path, params)

      case '..': // from grand parent route
        routable = _.reduce(ctx.props.routes.slice(0, -2),
                                (acc, route, index) => acc += '/' + _.trim(route.path, '/'),
                                '')

        return LinkUtil.mapPath(ctx, routable + '/' + _.trimLeft(path, '.'), params)
        break

      default: // append
        routable = _.reduce(ctx.props.routes,
                                (acc, route, index) => acc += '/' + _.trim(route.path, '/'),
                                '')

        path = '/' === path[0] ? path : (routable + '/' + path)
        return LinkUtil.mapPath(ctx, path, params)
    }
  }
}

export {LinkUtil}
