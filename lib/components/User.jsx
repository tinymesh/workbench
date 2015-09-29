import React from 'react'

import {Login} from './User/Login.jsx'
import {Logout} from './User/Logout.jsx'
import {Register} from './User/Register.jsx'

export class User extends React.Component {
  render() {
    return (
      <div>
        <h1>User</h1>
      </div>
    )
  }
}

export {
  Login,
  Logout,
  Register
}
