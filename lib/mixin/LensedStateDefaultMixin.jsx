/**
 * Created by laiff on 19.09.14.
 *
 * Mixin provided ReactLink with lensed attributes
 *
 * Example:
 *
 * var LensedExample = React.createClass({
 *
 *     mixins : [LensedStateMixin],
 *
 *     getInitialState : {
 *         fields : {
 *             user : {
 *                 name: "John",
 *                 email: "john@example.com"
 *             },
 *             notify : {
 *                 email : true,
 *                 fb: false
 *             }
 *         }
 *     },
 *
 *     render: function() {
 *         return (
 *             <form>
 *                 <input valueLink={this.linkState('fields.user.name')} type="text" name="name" />
 *                 <input valueLink={this.linkState('fields.user.email')} type="text" name="email" />
 *                 <input valueLink={this.linkState('fields.notify.email')} type="checkbox" name="notify-email" />
 *                 <input valueLink={this.linkState('fields.notify.fb')} type="checkbox" name="notify-fb" />
 *             </form>
 *         );
 *     }
 * });
 *
 * @providesModule LensedStateMixin
 * @typechecks static-only
 */

var ReactLink = require('react/lib/ReactLink'),
    ReactStateSetters = require('react/lib/ReactStateSetters');

/**
 * A simple mixin around ReactLink.forState().
 */
var LensedStateDefaultMixin = {

    /**
     * Create a ReactLink that's linked to part of this component's state. The
     * ReactLink will have the current value of lens(this.state, key) and will call
     * setState() when a change is requested.
     *
     * @param {string} key hierarchical state key to update.
     * Note: you may want to use keyOf() if you're using Google Closure Compiler advanced mode.
     *
     * @return {ReactLink} ReactLink instance linking to the state.
     */
    linkState : function(key, defaultValue, map) {
        var setter = function(state) {
            return function(value) {
                if (map)
                  value = map(value)

                return _.set(state, key, value)
            }
        };

        return new ReactLink(
            _.get(this.state, key, defaultValue),
            ReactStateSetters.createStateSetter(this, setter(this.state))
        );
    }
};

module.exports = LensedStateDefaultMixin;

