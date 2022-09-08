var ajaxCalls = [];
function runAjax() {
  if (ajaxCalls.length > 0) {
    var ajaxCall = ajaxCalls.shift();
    $.ajax(ajaxCall);
  }
}
function onWifiData(wifiData) {
  console.log(
    `webservice::WiFi strength: ${wifiData.signalStrength}; WiFi status: ${wifiData.status}`
  );
  console.log("webservice: cancelled wifi opertation");
  console.log(
    "webservice::Checking previous ajax batch: " +
      ajaxCalls.length +
      " left in batch"
  );
  if (ajaxCalls.length > 0) {
    console.log("webservice::Aborting new batch creation");
    return;
  }
  console.log("webservice::creating ajax batch for " + config.BASE_URL);
  $.when(readOne("token", ["settings"])).done(function (token) {
    $.when(readOne("gb_config", ["settings"])).done(function (data) {
      if (data != null) {
        var gb_config = JSON.parse(data);
        $.when(readAll(["activity"]))
          .done(function (data) {
            $.each(data, function (key, value) {
              if (ajaxCalls.length > 10) {
                return false;
              }
              console.log("webservice::sending record " + value.id);
              var fd = new FormData();
              var gameDescriptor = null;
              var dataProvider = null;
              var property = null;
              var properties = null;
              if (value.eventType === "hrm") {
                gameDescriptor = gb_config.activities.tizen.gameDescriptor;
                dataProvider = gb_config.activities.tizen.dataProvider;
                property = gb_config.activities.tizen.properties.hrm.id;
              } else if (value.eventType === "raw") {
                gameDescriptor = gb_config.activities.tizen.gameDescriptor;
                dataProvider = gb_config.activities.tizen.dataProvider;
                property = gb_config.activities.tizen.properties.raw.id;
              } else if (value.eventType === "acc") {
                gameDescriptor = gb_config.activities.tizen.gameDescriptor;
                dataProvider = gb_config.activities.tizen.dataProvider;
                property = gb_config.activities.tizen.properties.acc.id;
              } else if (value.eventType === "activity") {
                gameDescriptor = gb_config.activities.tizen.gameDescriptor;
                dataProvider = gb_config.activities.tizen.dataProvider;
                property = gb_config.activities.tizen.properties.activity.id;
              } else if (value.eventType === "fdbk") {
                gameDescriptor = gb_config.activities.feedback.gameDescriptor;
                dataProvider = gb_config.activities.feedback.dataProvider;
                properties = gb_config.activities.feedback.properties;
              } else if (value.eventType === "ntf") {
                gameDescriptor =
                  gb_config.activities.notification.gameDescriptor;
                dataProvider = gb_config.activities.notification.dataProvider;
                properties = gb_config.activities.notification.properties;
              } else if (value.eventType === "snz") {
                var snooze_data = {
                  firstName: "GameBus",
                  lastName: "Wearable",
                  message: "Snoozed Mood Log, Wanna log now?",
                  avatarName: "default",
                  avatarImage: "default",
                };
                ajaxCalls.push({
                  url: config.BASE_URL + config.SNOOZE_ENDPOINT,
                  type: "POST",
                  data: JSON.stringify(snooze_data),
                  contentType: "application/json",
                  headers: {
                    Authorization: token,
                  },
                  success: function (data) {
                    console.log("webservice::Snoozed successfully");
                    // removing on success
                    remove(value.id, ["activity"]);
                  },
                  error: function (e) {
                    console.log(`webservice::${e}`);
                  },
                  complete: function () {
                    runAjax();
                  },
                });
                console.log(
                  "webservice::Added to ajax batch. items in batch: " +
                    ajaxCalls.length
                );
                return;
              } else if (value.eventType === "gb_activity") {
                var activitytData = value.eventData;
                for (var i = 0; i < activitytData.length; i++) {
                  fd.append(
                    "activity",
                    '{"gameDescriptorTK":"' +
                      activitytData[i].gd_tk +
                      '","dataProvider":' +
                      gb_config.activities.tizen.dataProvider +
                      ',"date":' +
                      value.eventOccuredAt +
                      ',"propertyInstances":' +
                      JSON.stringify(activitytData[i].properties) +
                      ',"players":[]}'
                  );
                }
              } else {
                console.log("webservice::Unrecognizable entity");
                return;
              }
              if (value.eventType === "gb_activity") {
              } else if (properties === null) {
                fd.append(
                  "activity",
                  '{"gameDescriptor":' +
                    gameDescriptor +
                    ',"dataProvider":' +
                    dataProvider +
                    ',"date":' +
                    value.eventOccuredAt +
                    ',"propertyInstances":[{"property":' +
                    property +
                    ',"value":"' +
                    JSON.stringify(value.eventData).replace(/"/g, "'") +
                    '"}],"players":[]}'
                );
              } else {
                if (properties.hasOwnProperty("action")) {
                  fd.append(
                    "activity",
                    '{"gameDescriptor":' +
                      gameDescriptor +
                      ',"dataProvider":' +
                      dataProvider +
                      ',"date":' +
                      value.eventOccuredAt +
                      ',"propertyInstances":[{"property":' +
                      properties.action.id +
                      ',"value":"' +
                      value.eventData.action +
                      '"},{"property":' +
                      properties.notification_ts.id +
                      ',"value":' +
                      value.eventOccuredAt +
                      '}],"players":[]}'
                  );
                } else if (properties.hasOwnProperty("state_key")) {
                  fd.append(
                    "activity",
                    '{"gameDescriptor":' +
                      gameDescriptor +
                      ',"dataProvider":' +
                      dataProvider +
                      ',"date":' +
                      value.eventOccuredAt +
                      ',"propertyInstances":[{"property":' +
                      properties.state_key.id +
                      ',"value":"' +
                      value.eventData.emotion +
                      '"},{"property":' +
                      properties.state_value.id +
                      ',"value":"' +
                      value.eventData.intensity +
                      '"},{"property":' +
                      properties.feedback_ts.id +
                      ',"value":' +
                      value.eventOccuredAt +
                      '}],"players":[]}'
                  );
                } else {
                  console.log("webservice::Unrecognizable entity");
                  return;
                }
              }
              ajaxCalls.push({
                url: config.BASE_URL + config.ACITIVTY_ENDPOINT,
                type: "POST",
                dataType: "json",
                processData: false,
                contentType: false,
                data: fd,
                headers: {
                  Authorization: token,
                },
                beforeSend: function () {
                  console.log("webservice::requesting ajax...");
                },
                success: function (data) {
                  console.log("webservice::successfull ajax request");
                  // removing on success
                  remove(value.id, ["activity"]);
                },
                error: function (e) {
                  console.log(`webservice::${e}`);
                },
                complete: function () {
                  console.log("webservice::ajax call is done!");
                  // wait a bit before the next ajax call
                  setTimeout(runAjax, 5000);
                },
              });
              console.log(
                "webservice::Added to ajax batch. items in batch: " +
                  ajaxCalls.length
              );
            });
            // call first of many ajax calls
            console.log(
              "webservice::starting to call " +
                ajaxCalls.length +
                " ajax requests"
            );
            runAjax();
          })
          .fail(function (data) {
            console.log(`webservice::${JSON.stringify(data)}`);
          });
      }
    });
  });
}
function getWifiInfo() {
  tizen.systeminfo.getPropertyValue(
    "WIFI_NETWORK",
    onWifiData,
    function (error) {
      console.log(`webservice::${error}`);
    }
  );
  setTimeout(getWifiInfo, config.WIFI_INTERVAL);
}
function postSteps(startDate, endDate, steps, callBack, index, type) {
  var gd;
  if (type == "DA") {
    gd = gb_config.activities.aggregate.gameDescriptor;
  } else if (type == "DAW") {
    gd = gb_config.activities.waggregate.gameDescriptor;
  } else if (type == "DAR") {
    gd = gb_config.activities.raggregate.gameDescriptor;
  }
  $.when(readOne("token", ["settings"])).done(function (token) {
    var fd = new FormData();
    fd.append(
      "activity",
      '{"gameDescriptor":' +
        gd +
        ',"dataProvider":' +
        gb_config.activities.aggregate.dataProvider +
        ',"date":' +
        new Date().getTime() +
        ',"propertyInstances":[{"property":' +
        gb_config.activities.aggregate.properties.start_date.id +
        ',"value":"' +
        startDate +
        '"},{"property":' +
        gb_config.activities.aggregate.properties.end_date.id +
        ',"value":"' +
        endDate +
        '"},{"property":' +
        gb_config.activities.aggregate.properties.steps_sum.id +
        ',"value":"' +
        steps +
        '"}],"players":[]}'
    );
    var call = {
      url: config.BASE_URL + config.ACITIVTY_ENDPOINT,
      type: "POST",
      dataType: "json",
      processData: false,
      contentType: false,
      data: fd,
      headers: {
        Authorization: token,
      },
      beforeSend: function () {
        console.log("webservice::requesting ajax...");
      },
      success: function (data) {
        console.log("webservice::successfull ajax request");
        callBack(index, type);
      },
      error: function (e) {
        console.log(`webservice::${e}`);
      },
      complete: function () {
        console.log("webservice::ajax call is done!");
      },
    };
    $.ajax(call);
  });
}
