function humanize(property) {
  return property
    .replace(/_/g, " ")
    .replace(/(\w+)/g, function (match) {
      return match.charAt(0).toUpperCase() + match.slice(1);
    });
}

var defaults = {
  placeholder: "Type something...",
  firstOption: "Select something..."
};

SimpleSchema.prototype.i18n = function (jsonPath, options) {
  // do nothing on the server side
  if (Meteor.isServer) return;
  // iterate over schema keys
  var schema = this._schema;
  _.each(schema, function (value, key) {
    // skip invalid values
    if (!value) return;
    // get translations
    var keys = TAPi18n.__([jsonPath, key].join("."), { returnObjectTrees: true }) || {};
    // extend defaults
    var keyOptions = _.extend({}, defaults, { label: humanize(key) }, options);

    /**
     * Returns a function which returns a translation for the given attribute.
     * The result is determined in the following order:
     * 1. Translation
     * 2. Default value set via options
     * 3. Untranslated language key
     * @param {String} attribute
     * @returns {Function}
     */
    function translate(attribute) {
      var languageKey = [jsonPath, key, attribute].join(".");
      return function () {
        var translated = TAPi18n.__(languageKey);
        if (translated === key && keyOptions[attribute]) {
          return keyOptions[attribute];
        }
        return translated;
      };
    }

    // make sure the key has an autoform property
    var s = schema[key];
    if (!s.autoform) s.autoform = {};
    // translate label
    if (!s.label && keys.label) {
      s.label = translate("label");
    }
    // translate placeholder
    if (!s.autoform.placeholder && keys.placeholder) {
      s.autoform.placeholder = translate("placeholder");
    }
    // translate options
    if (!s.autoform.options && keys.options) {
      s.autoform.options = translate("options");
    }
    // translate firstOption
    if (!s.autoform.firstOption && keys.options) {
      s.autoform.firstOption = translate("firstOption");
    }
  });
  return schema;
};
