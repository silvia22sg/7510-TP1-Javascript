var Interpreter = function () {
  this.listFacts = [];
  this.listRule = [];
  this.isFacts = function (x){
  var facts = /^[^\(]*\([^)]*\)$/;
  return facts.exec(x);
 }
 this.parseDB = function (params, paramss, paramsss) {
  //Load all the Facts in a list, in other list all the Rules that exist in database
    for (var i = 0; i < params.length; i++) { 
       var elem = params[i].replace(/\s|\n|\t|\./g, "");
        if (this.isFacts(elem))this.listFacts.push(elem); 
        if (this.isRule(elem))this.listRule.push(elem); 
    }
 }
 this.isRule = function(x){
  var rule = /^[^\(]*\([^)]*\):-([^\(]*\([^)]*\), *)*([^\(]*\([^)]*\))$/;
  return rule.exec(x);
 }
 this.evaluateFacts = function(elem,listFacts){
//Checks if item ej:"varon(juan)" is in the list of Facts, ex: (padre(roberto,cecilia) varon(juan) mujer(maria))
  var hit = false;
      for (var i = 0; i < listFacts.length; i++) { 
         if (listFacts[i] === elem) {
           hit = true;
           break;
         }
      }
  return hit;
 }
 this.generateMap = function(listVariables,listValues){
  //Generate hash-map relating variables with value, ex: (X Y) and (pepe juan) -> {X pepe, Y juan}
  var mapVariables = {};
  if (listVariables.length && listValues.length ){
    for (var i = 0; i < listVariables.length; i++){
         mapVariables[listVariables[i]]=listValues[i];
    }
  }
  return mapVariables;
 }
 this.assignValue = function(text,mapVariables,listFacts){
  //Replace the variable by the value, ex: varon(X),padre(Y,X) -> varon(pepe),padre(juan,pepe)
  for ( var key in mapVariables){
    text= text.replace(new RegExp(key, 'g'),mapVariables[key]);
  }
  //Generate vector, ej: varon(pepe),padre(juan,pepe) -> [varon(pepe) padre(juan,pepe)]
  var listFactsQuery = (text.replace(/\),/,") ")).split(" ");
  //Check if the list of Query Facts are in the Facts list of the database, if one fails is false.
  var valid = true;
  for (var i = 0; i < listFactsQuery.length; i++){
    if (!this.evaluateFacts(listFactsQuery[i],listFacts)){
        valid = false;
        break;
    } 
  }
  return valid;
 }
 this.evaluateRule = function(query,listRules,listFacts){
  //Get the Query name, ex: varon(maria) -> varon
  var xlist = (query.replace(/\)|\(/g," ")).split(" ");
  var nameQuery = xlist[0];
  //Search the list of Rules by Query Name, ex: hijo -> (hija(X,Y):-mujer(X),padre(Y,X) hijo(X,Y):-varon(X),padre(Y,X))
  var valid = false;
  var yElem = "";
  var newFacts= [];
  for (var i = 0; i < listRules.length; i++) { 
    yElem = listRules[i];
    newFacts = (listRules[i].replace(/\)|\(/g," ")).split(" ");
    var nameRule = newFacts[0];
    if (nameRule === nameQuery){
      valid = true;
      break;
    }
  }
  //ex: hijo(pepe,juan) ->[pepe juan]
  var valueList = xlist[1].split(",");
  //ex: hija(X,Y) -> [X Y]
  var varList = newFacts[1].split(",");
  if (valid === true) {
    //In assignValue enter as parameters, ex: 1-> varon(X),padre(Y,X), 2-> {X pepe, Y juan}, 3-> lista de Facts
    var map = this.generateMap(varList,valueList);
    valid = this.assignValue((yElem.split(":-"))[1],map,listFacts);
  }
  return valid;
 }
 this.checkQuery = function (params) {
  var q = params.replace(/\s|\n|\t/g, "");
  var resultado = false;
  if (this.isFacts(q)){
    resultado = this.evaluateFacts(q,this.listFacts);
    if (!resultado){
      resultado = this.evaluateRule(q,this.listRule,this.listFacts);
    }
  }
  return resultado;
 }
}
module.exports = Interpreter;