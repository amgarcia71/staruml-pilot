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

    var myPath =  path.join( this.basePath , elem.name )

    // Get list of temoplates
      walk(__dirname + '/templates/', function(err, results, myPath ) {
        if (err) throw err;
        console.log('templates', results);


          // Templates
          for (var i = 0; i < results.length; i++) {
              var t = results[i]

              console.log(t)
              var template = Twig.twig({
                data:  fs.readFileSync( t  ).toString()
              });

              var fRelative = relativePath(t,'/templates/')
              var mPath = path.join(  myPath,  fRelative.split('.')[0]+'.'+fRelative.split('.')[1] ).replace("{{ name }}", elem.name).replace("{{name}}", elem.name)
              console.log ('m path' , mPath)


              var getDirName = require('path').dirname;
              var sOut =  fs.mkdirSync(getDirName(mPath), { recursive: true})
              console.log(sOut)

              fs.writeFileSync(   mPath   ,  template.render(elem).replaceAll('{*{','{{').replaceAll('}*}','}}') , { recursive: true })

          }



      },  myPath );

     
       

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
var walk = function(dir, done,  myPath) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results,myPath);
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res ) {
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
