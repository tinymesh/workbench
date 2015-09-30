import React from 'react'
import {Grid, Row, Col} from 'react-bootstrap'
import {Tabs, Tab, Nav, NavItem} from 'react-bootstrap'
import {PageHeader, Glyphicon} from 'react-bootstrap'

import BodyClass from 'react-body-classname'

import {TaggedItem} from '../UI.jsx'

import {Navigation} from './Navigation.jsx'

import {Network} from './Dashboard/Network.jsx'
import {Device} from './Dashboard/Device.jsx'

var graphImg = require('../../public/images/graph-example.png')

export class Dashboard extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      tab: 'data-flow'
    }
  }

  handleTabSelect(tab) {
    this.setState({tab})
  }

  render() {
    return (
      <BodyClass className="full-height theme-normal dashboard">
        <Grid fluid={true} style={{height: '100%', position: 'relative'}}>
          <Col md={3} lg={2} className="sidebar">
            Sidebar
          </Col>

          <Col md={9} lg={10}>
            <Row>
              <Navigation routes={this.props.routes} />
            </Row>

            <Row className="action-header">
              <Tabs activeKey={this.state.tab} onSelect={this.handleTabSelect.bind(this)}>
                <Tab eventKey="data-flow" title="Data Flow" style={{paddingLeft: 0}}>
                  <img src={graphImg} style={{marginTop: '5.9rem'}} className="pull-left" />
                  <div className="pull-left" style={{marginTop: '58px', marginLeft: '2rem', borderLeft: '1px solid whitesmoke'}}>
                    <Nav>
                      <NavItem>Tiny Mesh Office - Moss</NavItem>
                      <NavItem>HioF</NavItem>
                      <NavItem>OFK - Veum</NavItem>
                      <NavItem>Tiny Mesh Office - Delhi</NavItem>
                    </Nav>
                  </div>
                </Tab>

                <Tab eventKey="connection-stats" title="Connections">
                  You got connections, braw?
                </Tab>

                <Tab eventKey="network-metrics" title="Network Metrics">
                  Network Metrics
                </Tab>
              </Tabs>
            </Row>

            <Row className="info">
              <Col xs={12} md={6} style={{paddingLeft: '5rem'}}>
                <PageHeader>Latest Activity</PageHeader>

                <div className="items">
                  <TaggedItem tagStyle="info" close>
                    <TaggedItem.Date date={new Date()} />
                    <TaggedItem.Content>3 new devices was auto-provisione in <a>some network</a></TaggedItem.Content>
                  </TaggedItem>

                  <TaggedItem tagStyle="warning" close>
                    <TaggedItem.Date date={new Date()} />
                    <TaggedItem.Content>All gateways in <a>this network</a> disconnected</TaggedItem.Content>
                  </TaggedItem>

                  <TaggedItem tagStyle="info" close>
                    <TaggedItem.Date date={new Date()} />
                    <TaggedItem.Content><a>Olav</a> changed <a>HioF's</a> default <a>Building Sensors</a> config changed</TaggedItem.Content>
                  </TaggedItem>

                  <TaggedItem tagStyle="danger" close>
                    <TaggedItem.Date date={new Date()} />
                    <TaggedItem.Content>You had 3 failed login attemps</TaggedItem.Content>
                  </TaggedItem>

                  <TaggedItem tagStyle="danger" close>
                    <TaggedItem.Date date={new Date()} />
                    <TaggedItem.Content>Gateway <a>USB GW</a> in <a>TM Office</a> lost connection for 3 hours</TaggedItem.Content>
                  </TaggedItem>
                </div>
                <div className="items more-items text-center">
                  <a>
                    Older activity<br />
                    <Glyphicon glyph="chevron-down" />
                  </a>
                </div>
              </Col>

              <Col xs={12} md={6}>
                <PageHeader>Anouncements</PageHeader>

                <div className="items">
                  <TaggedItem tagStyle="info">
                    <TaggedItem.Title>Release: Tiny Connect 0.2.0</TaggedItem.Title>
                    <TaggedItem.Date date={new Date()} />
                    <TaggedItem.Content>
                      A new version of Tiny Connect was released. This release
                      adds support for auto update, protocol inspection and much more!
                      <br />
                      <a>Read more about this release</a>
                    </TaggedItem.Content>
                  </TaggedItem>

                  <TaggedItem tagStyle="warning">
                    <TaggedItem.Title>Maintenance: Database upgrade</TaggedItem.Title>
                    <TaggedItem.Date date={new Date()} />
                    <TaggedItem.Content>
                      We are doing some maintenance work on one of the database clusters
                      from <em>2015-09-29 10:00 UTC</em> to <em>2015-09-29 12:00 UTC</em>.

                      All systems should be operational during the upgrade.
                    </TaggedItem.Content>
                  </TaggedItem>

                  <TaggedItem tagStyle="danger">
                    <TaggedItem.Title>TCP: SSL Certificates expirey</TaggedItem.Title>
                    <TaggedItem.Date date={new Date()} />
                    <TaggedItem.Content>
                      The SSL certificates for the TCP endpoint will expire in
                      3 months. If you rely on manually importing these certificates
                      you should upgrade to the <a>these new certificates</a>
                    </TaggedItem.Content>
                  </TaggedItem>

                </div>
              </Col>
            </Row>
          </Col>
        </Grid>
      </BodyClass>
    )
  }
}

Dashboard.childRoutes = [
  {
    path: 'network/:nid',
    component: Network,
    childRoutes: Network.childRoutes
  },
  {
    path: 'device/:nid/:device',
    component: Device,
    childRoutes: Device.childRoutes
  }
]
