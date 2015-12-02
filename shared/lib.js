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
     * Sets the given attribute on an object to a function which returns a translation.
     * If the attribute is already set or the translation does not contain a definition for it nothing happens.
     * The result is determined in the following order:
     * 1. Translation
     * 2. Default value set via options
     * 3. Untranslated language key
     */
    function translate(obj, attribute) {
      if (obj[attribute] || !keys[attribute]) return;
      var languageKey = [jsonPath, key, attribute].join(".");
      obj[attribute] = function () {
        var translation = TAPi18n.__(languageKey);
        if (translation === key && keyOptions[attribute]) {
          return keyOptions[attribute];
        }
        return translation;
      };
    }

    // make sure the key has an autoform property
    var s = schema[key];
    if (!s.autoform) s.autoform = {};
    // add translations
    translate(s, "label");
    translate(s.autoform, "placeholder");
    translate(s.autoform, "options");
    translate(s.autoform, "firstOption");
  });
  return schema;
};
