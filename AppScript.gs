function processDataAndOutput() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data = sheet.getDataRange().getValues();

  var keywords = ["Python", "C++", "R", "NLP", "PyTorch", "Java", "Scala", "SQL", "TensorFlow", "Keras", "Scikit-learn", "Matplotlib", "Seaborn", "Azure", "Docker"];

  var titleRows = [];
  var segmentRows = [];
  var totalKeywordFrequency = {}; 
  var headers1 = ["Title", "URL", "Meta", "Keyword", "Times Appear"];
  var headers2 = ["Title", "URL", "Meta", "Keyword", "Paragraph Location"];
  var summaryHeader = ["Keyword", "Total Frequency"];

  // Initialize total frequency
  keywords.forEach(function (keyword) {
    totalKeywordFrequency[keyword] = 0;
  });

  for (var i = 1; i < data.length; i++) {
    var title = data[i][0];
    var meta = data[i][1];
    var content = data[i][2];
    var url = data[i][3];
    var paragraphs = content.split(/[.]/);
    var keywordFrequency = {};
    var keywordSegment = {};

    keywords.forEach(function (keyword) {
      var count = 0;
      var segments = [];
      var escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var regex = new RegExp("\\b" + escapedKeyword + "\\b", "gi");

      
      paragraphs.forEach(function (paragraph, index) {
        var matchCount = (paragraph.match(regex) || []).length; 
        if (matchCount > 0) {
          count += matchCount;
          for (var j = 0; j < matchCount; j++) {
            segments.push(index + 1);
          }
        }
      });

      keywordFrequency[keyword] = count;
      keywordSegment[keyword] = segments;
      totalKeywordFrequency[keyword] += count;
    });

    keywords.forEach(function (keyword) {
      var frequency = keywordFrequency[keyword] || 0;
      if (frequency > 0) {
        titleRows.push([title, url, meta, keyword, frequency]);
      }
    });

    keywords.forEach(function (keyword) {
      var segments = keywordSegment[keyword].join(",") || "None";
      if (segments !== "None") {
        segmentRows.push([title, url, meta, keyword, segments]);
      }
    });
  }

  // Sort keywords by total frequency in descending order
  var sortedKeywords = Object.entries(totalKeywordFrequency)
    .sort((a, b) => b[1] - a[1])
    .filter(([keyword, freq]) => freq > 0); // Exclude keywords with zero frequency

  // Output the data
  sheet.appendRow(["\n"]);
  sheet.appendRow(headers1);
  titleRows.forEach(row => sheet.appendRow(row));
  sheet.appendRow([""]);
  sheet.appendRow([""]);
  sheet.appendRow(headers2);
  segmentRows.forEach(row => sheet.appendRow(row));
  sheet.appendRow([""]);
  sheet.appendRow([""]); 
  sheet.appendRow(summaryHeader);

  sortedKeywords.forEach(([keyword, freq]) => {
    sheet.appendRow([keyword, freq]);
  });
}
