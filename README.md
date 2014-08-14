swig-react
===

A swig extension to allow React components to be embedded and precompiled in
Swig templates.

[![Build Status](https://travis-ci.org/jnu/swig-react.svg?branch=master)](https://travis-ci.org/jnu/swig-react)

### Install
Right now have to install from github:

```
$ npm install git://github.com/jnu/swig-react.git#v0.0.1 --save
```

### Setup
Extend swig with this module:

```javascript
var swig = require('swig');
require('swig-react').useTag(swig);
```

### Examples
You can now use the `react` tag in swig templates.

The following examples use this component:

```javascript
var FruitGreeting = React.createClass({

    getDefaultProps: {
        fruit: "banana"
    },

    render: function() {
        return (
            <span>
                Hello, {this.props.fruit}!
            </span>
        );
    }
});
```

#### Basic usage

```
{% react "FruitGreeting" %}
```

will output:

```
<div>
  <span react-...>
    Hello, banana!
  </span>
</div>
```