const fs = require('fs')

const codegen = require('./codegen-utils')
const Twig = require('twig') // Twig module
   


/**
 * DDL Generator
 */
class DDLGenerator {
  /**
   * @constructor
   *
   * @param {type.ERDDataModel} baseModel
   * @param {string} basePath generated files and directories to be placed
   */
  constructor (baseModel, basePath) {
    /** @member {type.Model} */
    this.baseModel = baseModel

    /** @member {string} */
    this.basePath = basePath
  }

  /***** properrties
  elem.columns.forEach
  col.primaryKey
  col.name
  col.unique
  col.foreignKey
  elem.name
  elem.getTypeString()

  *******/

  /**
   * Write code for table
   * @param {type.ERDEntity} elem
   * @param {Object} options
   */
   writeCodeForTable ( elem, options) {

    console.log (this.basePath)
    console.log ('generating '+ elem.name )
    
    // Get list of temoplates
      walk(__dirname + '/templates/', function(err, results) {
        if (err) throw err;
        console.log('templates', results);

        // Templates
      results.forEach(t=> {

          console.log(t)
          var template = Twig.twig({
            data:  fs.readFileSync( t ).toString()
          });

          var myPath = path.join( this.basePath , elem.name ,  relativePath(t,'/templates/').split('.')[0] ) 

          fs.writeFileSync( myPath,  template.render(elem), { recursive: true })

      })



      });

  }
 
  /**
   * Generate codes from a given element
   * @param {type.Model} elem
   * @param {string} path
   * @param {Object} options
   * @return {$.Promise}
   */
  generate (elem, basePath, options) {
   

    // DataModel
    if (elem instanceof type.ERDDataModel) {
     
      // Tables
      elem.ownedElements.forEach(e => {
        if (e instanceof type.ERDEntity) {
          this.writeCodeForTable( e, options)
        }
      })

      
   
    }
  }
}

/**
 * Generate
 * @param {type.Model} baseModel
 * @param {string} basePath
 * @param {Object} options
 */
function generate (baseModel, basePath, options) {
  var generator = new DDLGenerator(baseModel, basePath)
  return generator.generate(baseModel, basePath, options)
}


function relativePath(myPath , myRelative) {

  var strPos = myPath.indexOf(myRelative) + 11;

  return myPath.substring(strPos);



}


var path = require('path');
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

exports.generate = generate
