var DKSwing = require('./DKSwing.js');

// random tests
function testFunctions(data) {

  var axCol = DKSwing.getSwingDataForColumn(data, 'ax');
  var ayCol = DKSwing.getSwingDataForColumn(data, 'ay');
  var azCol = DKSwing.getSwingDataForColumn(data, 'az');
  var a = DKSwing.searchContinuityAboveValue(axCol,
                                             randIntFromTo(0, axCol.length/2),
                                             randIntFromTo(axCol.length/2, axCol.length),
                                             -Math.random(),
                                             randIntFromTo(0, 10) );
  var b = DKSwing.backSearchContinuityWithinRange(ayCol,
                                                  randIntFromTo(ayCol.length/2, ayCol.length),
                                                  randIntFromTo(0, ayCol.length/2),
                                                  -Math.random(),
                                                  Math.random(),
                                                  randIntFromTo(0, 10) );
  var c = DKSwing.searchContinuityAboveValueTwoSignals(axCol,
                                                       ayCol,
                                                       randIntFromTo(0, axCol.length/2),
                                                       randIntFromTo(axCol.length/2, axCol.length),
                                                       -Math.random(),
                                                       -Math.random(),
                                                       randIntFromTo(0, 10) );
  var d = DKSwing.searchMultiContinuityWithinRange(axCol,
                                                   randIntFromTo(0, axCol.length/2),
                                                   randIntFromTo(axCol.length/2, axCol.length),
                                                   -Math.random(),
                                                    Math.random(),
                                                   randIntFromTo(0, 10) );

}

function randIntFromTo(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

// CSV to array of objects
DKSwing.readSwingData('./latestSwing.csv')
  .then((swingData) => {
    for(var i=0; i<100; i++) {
      testFunctions(swingData);
    }
  })
  .catch((err) => {
    console.log("error reading data: " + err);
    process.exit(0);
  });
