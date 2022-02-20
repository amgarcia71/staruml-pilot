
const ddlGenerator = require('./ddl-generator')

function getGenOptions () {
  return {
    fileExtension: app.preferences.get('ddl.gen.fileExtension'),
    quoteIdentifiers: app.preferences.get('ddl.gen.quoteIdentifiers'),
    dropTable: app.preferences.get('ddl.gen.dropTable'),
    dbms: app.preferences.get('ddl.gen.dbms'),
    useTab: app.preferences.get('ddl.gen.useTab'),
    indentSpaces: app.preferences.get('ddl.gen.indentSpaces')
  }
}

/**
 * Command Handler for DDL Generation
 *
 * @param {Element} base
 * @param {string} path
 * @param {Object} options
 */
function _handleGenerate (base, path, options) {
  // If options is not passed, get from preference
  options = options || getGenOptions()
  // If base is not assigned, popup ElementPicker
  if (!base) {
    app.elementPickerDialog.showDialog('Select a data model to generate DDL', null, type.ERDDataModel).then(function ({buttonId, returnValue}) {
      if (buttonId === 'ok') {
        base = returnValue
        // If path is not assigned, popup Save Dialog to save a file
        if (!path) {
          var file = app.dialogs.showSaveDialog('Save DDL As...', null, null)
          if (file && file.length > 0) {
            path = file
            ddlGenerator.generate(base, path, options)
          }
        } else {
          ddlGenerator.generate(base, path, options)
        }
      }
    })
  } else {
    // If path is not assigned, popup Save Dialog to save a file
    if (!path) {
      var file = app.dialogs.showSaveDialog('Save DDL As...', null, null)
      if (file && file.length > 0) {
        path = file
        ddlGenerator.generate(base, path, options)
      }
    } else {
      ddlGenerator.generate(base, path, options)
    }
  }
}

/**
* Popup PreferenceDialog with DDL Preference Schema
*/
function _handleConfigure () {
  app.commands.execute('application:preferences', 'ddl')
}

function init () {
  app.commands.register('ddl:generate', _handleGenerate)
  app.commands.register('ddl:configure', _handleConfigure)
}

exports.init = init
