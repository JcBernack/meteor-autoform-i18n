function humanize(property) {
  return property
    .replace(/_/g, " ")
    .replace(/(\w+)/g, function (match) {
      return match.charAt(0).toUpperCase() + match.slice(1);
    });
}

function getKeys(jsonPath, key) {
  return TAPi18n.__([jsonPath, key].join("."), { returnObjectTrees: true }) || {};
}

var defaults = {
  placeholder: "Type something...",
  firstOption: "Select something..."
};

SimpleSchema.prototype.i18n = function (jsonPath, options) {
  // do nothing on the server side
  if (Meteor.isServer) return;
  // extend defaults
  options = _.extend(defaults, options);
  // iterate over schema keys
  var schema = this._schema;
  _.each(schema, function (value, key) {

    if (!value) return;
    var keys = getKeys(jsonPath, key);

    // make sure the key has an autoform property
    var s = schema[key];
    if (!s.autoform) s.autoform = {};

    if (!s.autoform.placeholder && keys.placeholder) {
      s.autoform.placeholder = function () {
        return getKeys(jsonPath, key).placeholder || options.placeholder;
      };
    }

    if (!s.autoform.options && keys.options) {
      s.autoform.options = function () {
        return getKeys(jsonPath, key).options;
      };
    }

    if (!s.autoform.firstOption && keys.options) {
      s.autoform.firstOption = function () {
        return getKeys(jsonPath, key).placeholder || options.firstOption;
      };
    }

    if (!s.label && keys.label) {
      s.label = function () {
        return getKeys(jsonPath, key).label || humanize(key);
      };
    }

  });
  return schema;
};
