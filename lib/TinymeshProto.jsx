export class TinymeshProto {
   static SET_OUTPUT: 1
   static SET_PWM: 2
   static SEND_SERIAL: 4
   static GENERIC: 8

   static get types() {
      return {
         SET_OUTPUT: 1,
         SET_PWM: 2,
         SEND_SERIAL: 4,
         GENERIC: 8
      }
   }

   static get commands() {
      return {
         'set_output': {
            name: 'Set Output',
            type: TinymeshProto.types.SET_OUTPUT,
            comment: "The <code>`command/set_output`</code> allows \
                      control of the digital outputs of a device. There \
                      is no response unless <code>`device.command_ack`</code> \
                      is enabled OR the <code>`ACK`</code> bit is set in \
                      the command number."
         },

         'set_pwm': {
            name: 'Set PWM',
            type: TinymeshProto.types.SET_PWM,
            comment: "The <code>`command/set_pwm`</code> sets the the \
                      duty cycle of the <code>`PWM`</code> output of a \
                      device. There is no response unless <code>`device.command_ack`</code> \
                      is enabled OR the <code>`ACK`</code> bit is set in \
                      the command number."
         },

         'serial': {
            name: 'Serial Data',
            type: TinymeshProto.types.SEND_SERIAL,
            comment: "The <code>`command/serial`</code> sends a data frame \
                      to the UART of a device. There is no response in the \
                      protocol but a <code>\`ACK\`</code> may be returned \
                      or the device itself may respond with serial data."
         },

         'init_gw_config':  {
            name: 'Set GW in Config Mode',
            comment: "The <code>`command/init_gw_config`</code> sets \
                      the connected gateway into configuration mode. \
                      <b>Warning</b>: If your DCU looses connectivity \
                      with the cloud there is no way of it to \
                      re-connected without a reset."
         },

         'get_nid':         {
            name: 'Get NID',
            type: TinymeshProto.types.GENERIC,
            comment: "The <code>`command/get_nid`</code> queries a \
                      gateway device for it's Network ID. The response \
                      is a `event/nid` packet containing the network ID. \
                      <b>Note</b>: Only gateways respond to \
                      <code>`command/get_nid`</code> packets."
            },

         'get_status': {
            name: 'Get Status',
            type: TinymeshProto.types.GENERIC,
            comment: "A <code>`command/get_status`</code> command queries a device to return it's \
                      current status. The response will be a <code>`event/ima`</code>\
                      packet containing the standard event format."
         },

         'get_did_status': {
            name: 'Get DID Status',
            type: TinymeshProto.types.GENERIC,
            comment: "The <code>`command/get_did_status`</code> queries a device \
                      for it's next receiver. The response from the device \
                      will be a <code>`event/next_receiver`</code> packet \
                      containing the next receiver in the <code>`address`</code> \
                      field.  <em>The next receiver is the preferred route \
                      for the device to communicate through."
         },

         'get_config': {
            name: 'Get Config',
            type: TinymeshProto.types.GENERIC,
            comment: "The <code>`command/get_config`</code> queries a \
                     device for its configuration. The device will \
                     respond with a <code>`event/config`</code> containing \
                     all the configuration parameters in the device."
         },

         'get_calibration': {
            name: 'Get Calibration',
            type: TinymeshProto.types.GENERIC,
            comment: "The <code>`command/get_calibration`</code> queries a \
                     device for the contents of it's calibration memory. The device will \
                     respond with a <code>`event/config`</code> containing \
                     all the configuration parameters in the device."
         },

         'force_reset': {
            name: 'Force Reset',
            type: TinymeshProto.types.GENERIC,
            comment: "The <code>`command/force_reset`</code> asks the device \
                      to do a power cycle. Once the device is up a \
                      <code>`event/reset`</code> packet will be returned \
                      containing <code>`trigger := 'command'`</code>"
         },

         'get_path': {
            name: 'Get Path',
            type: TinymeshProto.types.GENERIC,
            comment: "The <code>`command/get_path`</code> asks the device \
                      to return a list of all the communications paths \
                      in the system in the form of a <code>`event/path`</code> \
                      with all the hops and their signal strength (RSSI) \
                      in the <code>`path`</code> key."
         },
      }
   }
}
