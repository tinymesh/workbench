import React from 'react'
import {Modal, Glyphicon} from 'react-bootstrap'

export class ErrorModal extends React.Component {
   render() {
      let {error, onHide} = this.props

      return (
         <Modal
            className="modal-error"
            onHide={onHide}
            show={error !== null}>

            <Modal.Header closeButton>
               <Glyphicon glyph="alert">&nbsp;</Glyphicon>

               An unexpected error occured
            </Modal.Header>

            {error && <Modal.Body>
              <b>{error.message} in {error.file}:{error.line}#{error.column}</b>
              <hr />
              <pre>{error.stack}</pre>
            </Modal.Body>}
         </Modal>
      )
   }
}
