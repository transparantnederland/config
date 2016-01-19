var argv = require('minimist')(process.argv.slice(2));

var fs = require('fs');
var path = require('path');
var util = require('util');
var _ = require('lodash');
var yaml = require('js-yaml');
var schema = require(path.join(__dirname, 'config.schema.json'));
var validator = require('is-my-json-valid');
var validate = validator(schema);

function die(message) {
  console.error(message);
  process.exit(-1);
}

module.exports = (function() {
  var config;
  var filename = argv.config || process.env.TNL_CONFIG;
  
  console.log("tnl-config: " + filename)

  if (!filename) {
    die('Please specify location of your user configuration in environment variable `TNL_CONFIG`, or use the `--config` command line option');
  }

  try {
    config = yaml.safeLoad(fs.readFileSync(path.join(__dirname, 'default.yml'), 'utf8'));
  } catch (e) {
    die('Failed to open default configuration file `default.yml`');
  }

  try {
    var userConfig = yaml.safeLoad(fs.readFileSync(filename, 'utf8'));
  } catch (e) {
    die(util.format('Can\'t open configuration file `%s`', filename));
  }

  // Merge default config file with user config
  // However, arrays should not be merged - all arrays in default config which are
  // also in userConfig should be emptied first
  config = _.merge(config, userConfig, function(a, b) {
    if (_.isArray(a)) {
      return b;
    }
  });

  if (validate(config)) {
    return config;
  } else {
    die('Invalid configuration file: ' + JSON.stringify(validate.errors));
  }
}());
