"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var kebabCase = require("lodash.kebabcase");
var React = require("react");
/**
 * Wraps an Angular component in React. Returns a new React component.
 *
 * Usage:
 *
 *   ```ts
 *   const Bar = { bindings: {...}, template: '...', ... }
 *
 *   angular
 *     .module('foo', [])
 *     .component('bar', Bar)
 *
 *   type Props = {
 *     onChange(value: number): void
 *   }
 *
 *   const Bar = angular2react<Props>('bar', Bar, $compile)
 *
 *   <Bar onChange={...} />
 *   ```
 */
function angular2react(componentName, component, $injector) {
    return /** @class */ (function (_super) {
        __extends(class_1, _super);
        function class_1() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.state = {
                didInitialCompile: false
            };
            return _this;
        }
        class_1.prototype.componentWillMount = function () {
            this.setState({
                scope: Object.assign($injector.get('$rootScope').$new(true), { props: writable(this.props) })
            });
        };
        class_1.prototype.componentWillUnmount = function () {
            if (!this.state.scope) {
                return;
            }
            this.state.scope.$destroy();
        };
        class_1.prototype.shouldComponentUpdate = function () {
            return false;
        };
        // called only once to set up DOM, after componentWillMount
        class_1.prototype.render = function () {
            var bindings = {};
            if (component.bindings) {
                for (var binding in component.bindings) {
                    bindings[kebabCase(binding)] = "props." + binding;
                }
            }
            return React.createElement(kebabCase(componentName), __assign({}, bindings, { ref: this.compile.bind(this) }));
        };
        // makes angular aware of changed props
        // if we're not inside a digest cycle, kicks off a digest cycle before setting.
        class_1.prototype.componentWillReceiveProps = function (props) {
            if (!this.state.scope) {
                return;
            }
            this.state.scope.props = writable(props);
            this.digest();
        };
        class_1.prototype.compile = function (element) {
            if (this.state.didInitialCompile || !this.state.scope) {
                return;
            }
            $injector.get('$compile')(element)(this.state.scope);
            this.digest();
            this.setState({ didInitialCompile: true });
        };
        class_1.prototype.digest = function () {
            if (!this.state.scope) {
                return;
            }
            try {
                this.state.scope.$digest();
            }
            catch (e) { }
        };
        return class_1;
    }(React.Component));
}
exports.angular2react = angular2react;
/**
 * Angular may try to bind back a value via 2-way binding, but React marks all
 * properties on `props` as non-configurable and non-writable.
 *
 * If we use a `Proxy` to intercept writes to these non-writable properties,
 * we run into an issue where the proxy throws when trying to write anyway,
 * even if we `return false`.
 *
 * Instead, we use the below ad-hoc proxy to catch writes to non-writable
 * properties in `object`, and log a helpful warning when it happens.
 */
function writable(object) {
    var _object = {};
    var _loop_1 = function (key) {
        if (object.hasOwnProperty(key)) {
            Object.defineProperty(_object, key, {
                get: function () { return object[key]; },
                set: function (value) {
                    if (Object.getOwnPropertyDescriptor(object, key).writable) {
                        return object[key] = value;
                    }
                    else {
                        console.warn("Tried to write to non-writable property \"" + key + "\" of", object, ". Consider using a callback instead of 2-way binding.");
                    }
                }
            });
        }
    };
    for (var key in object) {
        _loop_1(key);
    }
    return _object;
}
//# sourceMappingURL=index.js.map