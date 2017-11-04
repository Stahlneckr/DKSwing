var parse     = require('csv-parse');
var fs        = require('fs');
var Promise   = require("bluebird");
var winston   = require('winston');

fs = Promise.promisifyAll(fs);
parse = Promise.promisify(parse);

// = Winston Setup =
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {level: 'debug', colorize: true, prettyPrint: true});
winston.addColors({ info: 'blue', error: 'red' });

class DKSwing {
  static readSwingData(swingDataCSV) {
    // read data file and add the data as an array of objects
    return new Promise(function(resolve, reject) {
      fs.readFileAsync(swingDataCSV, 'utf8')
        .then((data) => {
          return parse(data, { columns: ['ts', 'ax', 'ay', 'az', 'wx', 'wy', 'wz'] })
        })
        .then((rows) => {
          var swing = Object.keys(rows).map(key => rows[key]);
          return resolve(swing);
        })
        .catch((err) => {
          winston.error("error reading data: " + err);
          return reject(err);
        });
    });
  }

  static getSwingDataForColumn(data, col) {
    return data.map(a => a[col]);
  }

  // from indexBegin to indexEnd, search data for values that are higher than threshold.
  // Return the first index where data has values that meet this criteria for at least winLength samples.
  static searchContinuityAboveValue(data, indexBegin, indexEnd, threshold, winLength) {
    if((indexBegin+winLength)>=indexEnd || indexBegin<0 || indexBegin>=data.length || indexEnd>=data.length) {
      return -10;
    }

    var winStart = -1;
    var count = 0;
    for(var i = indexBegin; i<=indexEnd; i++) {
      if(data[i]>threshold) {
        count++;
        if(winStart === -1) {
          winStart = i;
        }
        if(count === winLength) {
          return winStart;
        }
      } else {
        winStart = -1;
        count = 0;
      }
    }
    return -1;
  }

  // from indexBegin to indexEnd (where indexBegin is larger than indexEnd), search data for values that are higher than thresholdLo and lower than thresholdHi.
  // Return the first index where data has values that meet this criteria for at least winLength samples.
  static backSearchContinuityWithinRange(data, indexBegin, indexEnd, thresholdLo, thresholdHi, winLength) {
    if((indexBegin-winLength)<=indexEnd || indexBegin<0 || indexBegin>=data.length || indexEnd>=data.length) {
      return -10;
    }

    var winStart = -1;
    var count = 0;
    for(var i = indexBegin; i>=indexEnd; i--) {
      if(data[i]>thresholdLo && data[i]<thresholdHi) {
        count++;
        if(winStart === -1) {
          winStart = i;
        }
        if(count === winLength) {
          return winStart;
        }
      } else {
        winStart = -1;
        count = 0;
      }
    }
    return -1;
  }

  // from indexBegin to indexEnd, search data1 for values that are higher than threshold1 and also search data2 for values that are higher than threshold2.
  // Return the first index where both data1 and data2 have values that meet these criteria for at least winLength samples.
  static searchContinuityAboveValueTwoSignals(data1, data2, indexBegin, indexEnd, threshold1, threshold2, winLength) {
    var index1, index2;
    var index1 = index2 = indexBegin;

    index1 = DKSwing.searchContinuityAboveValue(data1, index1, indexEnd, threshold1, winLength);
    index2 = DKSwing.searchContinuityAboveValue(data2, index2, indexEnd, threshold2, winLength);

    while(index1>0 && index2>0) {
      if(index1 === -1 || index2 === -1) {
        return -1;
      }

      if(index1 === index2) {
        return index1;
      } else if(index1>index2) {
        index2 = DKSwing.searchContinuityAboveValue(data2, index2+1, indexEnd, threshold2, winLength);
      } else {
        index1 = DKSwingsearchContinuityAboveValue(data1, index1+1, indexEnd, threshold1, winLength);
      }
    }

    return -1;
  }

  // from indexBegin to indexEnd, search data for values that are higher than thresholdLo and lower than thresholdHi.
  // Return the the starting index and ending index of all continuous samples that meet this criteria for at least winLength data points.
  static searchMultiContinuityWithinRange(data, indexBegin, indexEnd, thresholdLo, thresholdHi, winLength) {
    if((indexBegin+winLength)>indexEnd || indexBegin<0 || indexBegin>data.length || indexEnd<0 || indexEnd>=data.length) {
      return -10;
    }

    var ranges = [];

    var winStart = -1;
    var count = 0;
    for(var i = indexBegin; i<=indexEnd; i++) {
      if(data[i]>thresholdLo && data[i]<thresholdHi) {
        if(winStart === -1) {
          winStart = i;
        }
        count++;
      } else {
        if(count>=winLength) {
          ranges.push({ 'indexStart': winStart, 'indexEnd': i-1 });
          winStart = -1;
        }
      }
    }
    return ranges;
  }
}

module.exports = DKSwing;
