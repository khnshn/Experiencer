/*
 * Global variables
 */
var message = "Please click on `open app` below first and then `Self-report`";
var disablebBackButton = false;
var gb_config;
var sensorStartTime;
var sensorForceStop = false;
var alarm_id;
var alarm_insert;
var typ;
// sensor data will be appended to these, cleared after storage in db
var hrm_array = [];
var ppg_array = [];
// var example_3 = {
//   // to be fetched from the config file later
//   dataProvider_id: 13,
//   questions: [
//     {
//       type: "multiple",
//       answers: [
//         { text: "Extremely alert", value: 1 },
//         { text: "Alert", value: 2 },
//         { text: "Neither alert nor sleepy", value: 2 },
//         { text: "Sleepy, but no difficulty remaining awake", value: 3 },
//         { text: "Extremely sleepy, fighting sleep", value: 4 },
//       ],
//       question: "How alert of sleepy do you feel at the moment?",
//       property_tk: "ALERT_OR_SLEEPY_ANSWER",
//       gameDescriptor_tk: "HOW_ALERT_OR_SLEEPY_DO_YOU_FEEL_AT_THE_MOMENT",
//     },
//     {
//       type: "multiple",
//       answers: [
//         { text: "Very convenient", value: 1 },
//         { text: "Convenient", value: 2 },
//         { text: "Somewhat convenient", value: 2 },
//         { text: "Neither convenient nor inconvenient", value: 3 },
//         { text: "Somewhat inconvenient", value: 4 },
//         { text: "Inconvenient", value: 5 },
//         { text: "Very inconvenient", value: 6 },
//       ],
//       question:
//         "How convenient or inconvenient was the timing of the notification for you?",
//       property_tk: "CONVENIENT_OR_INCONVENIENT_ANSWER",
//       gameDescriptor_tk:
//         "HOW_CONVENIENT_OR_INCONVENIENT_WAS_THE_TIMING_OR_THE_NOTIFICATION_FOR_YOU",
//     },
//   ],
// };
var acc_array = [];
// same as notification id
var sensor_key;
// sensor objects
var ppg_sensor;
var acc_sensor;
// hrm stop checker
var hrm_stopped = false;
// check if data is added in case of multiple stop calls to prevent sensor data redundancy
var hrm_added = false;
var ppg_added = false;
var acc_added = false;
/*
 * prepare UI
 */
function prepareUI() {
  // prepare the UI of questionnaire
  var question_ids = [];
  var selector = "#ui-content";
  var item_selector = " > div > ul > li > a";
  $(selector).empty();
  var questions = parseJson(gb_config.questionnaire.questions); // TODO: fetch it from the config
  question_ids = prepareQuestions(questions, selector);
  // 0
  var firstPopUpToGetRead = document.getElementById("q-1");
  firstPopUpToGetRead.addEventListener("popupshow", function () {
    add(
      {
        eventKey: Number($("#process-id").val()),
        eventType: "ntf",
        eventOccuredAt: new Date().getTime(),
        eventData: { action: "READ" },
      },
      ["activity"]
    );
  });
  $("#" + question_ids[0] + item_selector).click(function () {
    var clickedVal = $(this).data("val");
    var clickedGd = $(this).data("gd");
    var clickedTk = $(this).data("tk");
    add(
      {
        eventKey: new Date().getTime(),
        eventType: "gb_activity",
        eventOccuredAt: new Date().getTime(),
        eventData: [
          {
            gd_tk: clickedGd,
            properties: [{ propertyTK: clickedTk, value: clickedVal }],
          },
        ],
      },
      ["activity"]
    );
  });
  // 1..n-2
  for (let i = 1; i < question_ids.length - 1; i++) {
    $("#" + question_ids[i] + item_selector).click(function () {
      var clickedVal = $(this).data("val");
      var clickedGd = $(this).data("gd");
      var clickedTk = $(this).data("tk");
      add(
        {
          eventKey: new Date().getTime(),
          eventType: "gb_activity",
          eventOccuredAt: new Date().getTime(),
          eventData: [
            {
              gd_tk: clickedGd,
              properties: [{ propertyTK: clickedTk, value: clickedVal }],
            },
          ],
        },
        ["activity"]
      );
    });
  }
  //n-1
  $("#" + question_ids[question_ids.length - 1] + item_selector).click(
    function () {
      var clickedVal = $(this).data("val");
      var clickedGd = $(this).data("gd");
      var clickedTk = $(this).data("tk");
      add(
        {
          eventKey: new Date().getTime(),
          eventType: "gb_activity",
          eventOccuredAt: new Date().getTime(),
          eventData: [
            {
              gd_tk: clickedGd,
              properties: [{ propertyTK: clickedTk, value: clickedVal }],
            },
          ],
        },
        ["activity"]
      );
      toastSaving();
      // $(document).trigger("feedbackEvent", { "emotion": emotion + 1, "intensity": intensity + 1 });
    }
  );
  // for (let i = 0; i < question_ids.length; i++) {
  //   $("#" + question_ids[i]).addEventListener("popupshow", function () {
  //     console.log("`popupshow` fired");
  //     $(".ui-popup-wrapper").scrollTop(0);
  //   });
  // }
}
function toastDone() {
  var messages = [
    "You are the best",
    "You rock",
    "Bravo zulu",
    "keep it coming",
    "Lovely jubbly",
    "Awesome possum",
    "Nicely done",
    "You did it",
  ];
  $("#done-message").html(
    '<div class="ui-popup-toast-icon ui-popup-toast-check-icon"></div>' +
      messages[Math.round(Math.random() * 10) % messages.length] +
      "!"
  );
  tau.openPopup($("#done-popup-toast"));
}
function toastSaving() {
  disablebBackButton = true;
  tau.openPopup($("#saving-popup"));
  setTimeout(() => {
    disablebBackButton = false;
    tau.closePopup($("#saving-popup"));
    toastDone();
  }, 10000);
}
/*
 * init gb_config
 */
$.when(readOne("gb_config", ["settings"])).done(function (data) {
  if (data != null) {
    gb_config = JSON.parse(data);
  }
});
/*
 * Event listeners
 */
var preparingPopup = document.getElementById("preparing-popup");
var doneToast = document.getElementById("done-popup-toast");
var infoToast = document.getElementById("info-popup-toast");
doneToast.addEventListener("popupbeforeshow", function () {
  console.log("`popupbeforeshow` fired");
  // stop sensors
  sensorForceStop = true;
});
doneToast.addEventListener("popuphide", function () {
  console.log("`popuphide` fired");
  tizen.application.getCurrentApplication().hide();
});

preparingPopup.addEventListener("popupbeforeshow", function () {
  console.log("`popupbeforeshow` fired");
  // disable back press
  disablebBackButton = true;
  // start sensors
  sensorForceStop = false;
  startSensors();
});

$(document).on("popupEvent", { type: "UI" }, function (event, data) {
  $("#process-id").val(data);
  prepareUI(); // new addition to create dynamic questionnaire
  tau.openPopup(preparingPopup);
  setTimeout(() => {
    tau.closePopup(preparingPopup);
    tau.openPopup($("#q-1")); // open the first question in the set of questionnaires
  }, 7000);
});
$(document).on("popupInfoEvent", { type: "UI" }, function (event, data) {
  tau.openPopup(infoToast);
});
$(document).on("feedbackEvent", { type: "UI" }, function (event, data) {
  console.log("`feedbackEvent` for " + $("#process-id").val() + " fired");
  add(
    {
      eventKey: Number($("#process-id").val()),
      eventType: "fdbk",
      eventOccuredAt: new Date().getTime(),
      eventData: data,
    },
    ["activity"]
  );
});
/*
 * Push server callbacks
 */
function pushRegisterSuccessCallback(id) {
  console.log("Registration succeeded with id: " + id);
  $.when(readOne("token", ["settings"])).done(function (data) {
    if (data != null) {
      console.log("gb token: " + data);
      $("#qrcodes")
        .hide()
        .promise()
        .done(function () {
          console.log(`authenticated with gb token ${data}`);
        });
      getConfig();
    } else {
      makeQrCode(id);
      $("#feedback").hide();
    }
  });
}
function pushStateChangeCallback(state) {
  console.log("The state is changed to: " + state);
  if (state == "UNREGISTERED") {
    tizen.push.register(pushRegisterSuccessCallback, pushErrorCallback);
  } else {
    console.log("Registration id: " + tizen.push.getRegistrationId());
    $.when(readOne("token", ["settings"])).done(function (data) {
      if (data != null) {
        console.log("gb token: " + data);
        $("#qrcodes")
          .hide()
          .promise()
          .done(function () {
            console.log(`authenticated with gb token ${data}`);
          });
        getConfig();
      } else {
        makeQrCode(tizen.push.getRegistrationId());
        $("#feedback").hide();
      }
    });
  }
}
function pushNotificationCallback(notification) {
  var appData = JSON.parse(notification.appData);
  console.log(`notification received with ${notification.appData}`);
  if (appData.hasOwnProperty("token")) {
    update({ key: "token", value: appData.token }, ["settings"], function () {
      $("#qrcodes")
        .hide()
        .promise()
        .done(function () {
          console.log(`authenticated with gb token ${appData.token}`);
        });
      getConfig();
    });
  } else if (appData.hasOwnProperty("policy")) {
    gb_config = appData;
    update({ key: "gb_config", value: JSON.stringify(gb_config) }, [
      "settings",
    ]);
    console.log("gb_config updated");
    console.log(gb_config);
  } else {
    notify(JSON.parse(notification.appData));
  }
}
function pushErrorCallback(response) {
  console.log("push error: " + response.name);
}
/*
 * Sensor on Change Functions
 */
function sensorStopCheck() {
  return (
    new Date().getTime() > sensorStartTime + config.SENSOR_RECORDING ||
    sensorForceStop
  );
}
function onHrmChange(hrmInfo) {
  if (sensorStopCheck()) {
    if (hrm_stopped) {
      return;
    }
    hrm_stopped = true;
    console.log("onHrmChange()::stop(`HRM`)");
    tizen.humanactivitymonitor.stop("HRM");
    if (!hrm_added) {
      hrm_added = true;
      add(
        {
          eventKey: sensor_key,
          eventOccuredAt: new Date().getTime(),
          eventType: "hrm",
          eventData: hrm_array,
        },
        ["activity"],
        function () {
          console.log("indexedDB::add()::callback()");
          hrm_array = [];
        }
      );
    }
  } else {
    var data = {
      ts: new Date().getTime(),
      hr: hrmInfo.heartRate,
      pp: hrmInfo.rRInterval,
    };
    if (hrmInfo.heartRate != 0 || hrmInfo.rRInterval != 0) {
      hrm_array.push(data);
    }
  }
}
function onPpgChange(ppgInfo) {
  if (sensorStopCheck()) {
    console.log("onPpgChange()::stop(`HRM_RAW`)");
    ppg_sensor.unsetChangeListener();
    ppg_sensor.stop();
    if (!ppg_added) {
      ppg_added = true;
      add(
        {
          eventKey: sensor_key,
          eventOccuredAt: new Date().getTime(),
          eventType: "raw",
          eventData: ppg_array,
        },
        ["activity"],
        function () {
          console.log("indexedDB::add()::callback()");
          ppg_array = [];
        }
      );
    }
  } else {
    var data = {
      ts: new Date().getTime(),
      li: ppgInfo.lightIntensity,
    };
    ppg_array.push(data);
  }
}
function onAccChange(accInfo) {
  if (sensorStopCheck()) {
    console.log("onAccChange()::stop(`ACCELERATION`)");
    acc_sensor.unsetChangeListener();
    acc_sensor.stop();
    if (!acc_added) {
      acc_added = true;
      add(
        {
          eventKey: sensor_key,
          eventOccuredAt: new Date().getTime(),
          eventType: "acc",
          eventData: acc_array,
        },
        ["activity"],
        function () {
          console.log("indexedDB::add()::callback()");
          acc_array = [];
        }
      );
    }
  } else {
    var data = {
      ts: new Date().getTime(),
      x: accInfo.x,
      y: accInfo.y,
      z: accInfo.z,
    };
    acc_array.push(data);
  }
}
/*
 * Functions
 */
function refreshToken() {
  var username = $("#input-username-ref").val().trim();
  var password = $("#input-password-ref").val();
  var settings = {
    url: config.BASE_URL + "/oauth/token",
    method: "POST",
    timeout: 0,
    headers: {
      Authorization: AUTH_TOKEN,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: {
      grant_type: "password",
      username: username,
      password: password,
    },
    success: function (data) {
      var token = data.access_token;
      update({ key: "token", value: token }, ["settings"], function () {
        console.log("gb token: " + token);
        tau.closePopup($("#refresh-popup"));
      });
    },
    error: function (e) {
      console.log(e);
      if (e.status != 200) {
        $("#error-message").html(`<p>${e.statusText} ${e.status}</p>`);
        tau.openPopup($("#generic-error-popup-toast"));
      }
    },
    complete: function () {},
  };
  $.ajax(settings);
}
function login() {
  var username = $("#input-username").val().trim();
  var password = $("#input-password").val();
  var settings = {
    url: config.BASE_URL + "/oauth/token",
    method: "POST",
    timeout: 0,
    headers: {
      Authorization:
        "Basic Z2FtZWJ1c19iYXNlX2FwcDppdkFxTFNSSnBRaDJ4QzE4OVYySEFvblVXWmd4UnVZQg==",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: {
      grant_type: "password",
      username: username,
      password: password,
    },
    success: function (data) {
      var token = data.access_token;
      if (config.TIZEN_PUSH) {
        var register = {
          url: config.BASE_URL + "/wearables/tizen/register",
          method: "POST",
          timeout: 0,
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          data: JSON.stringify({
            registerId: tizen.push.getRegistrationId(),
          }),
        };
        tau.closePopup(document.getElementById("generic-error-popup-toast"));
        $.ajax(register).done(function (response) {
          console.log(response);
        });
      } else {
        update({ key: "token", value: token }, ["settings"], function () {
          console.log("gb token: " + token);
          $("#qrcodes")
            .hide()
            .promise()
            .done(function () {
              console.log(`authenticated with gb token ${token}`);
            });
          getConfig();
          tau.closePopup(document.getElementById("generic-error-popup-toast"));
        });
      }
    },
    error: function (e) {
      console.log(e);
      if (e.status != 200) {
        $("#error-message").html(`<p>${e.statusText} ${e.status}</p>`);
        tau.openPopup($("#generic-error-popup-toast"));
      }
    },
    complete: function () {},
  };

  $.ajax(settings);
}
function logout() {
  //remove all alarms
  tizen.alarm.removeAll();
  //clear the db
  clearDb("activity", function () {
    clearDb("settings", function () {
      tizen.application.getCurrentApplication().exit();
    });
  });
}
function checkAlarm() {
  var alarms = tizen.alarm.getAll();
  if (alarms.length > 1) {
    tizen.alarm.removeAll();
    remove("alarm", ["settings"]);
  }
  $.when(readOne("alarm", ["settings"])).done(function (data) {
    if (data != null) {
      try {
        var alarm = tizen.alarm.get(Number(data));
        console.log(
          "The alarm " +
            alarm.id +
            " triggers " +
            alarm.getRemainingSeconds() +
            " seconds later"
        );
        tizen.application.getCurrentApplication().hide();
      } catch (error) {
        console.log("No alarm");
        makeAlarm();
      }
    } else {
      console.log("No alarm");
      makeAlarm();
    }
  });
}
function saveSteps() {
  if (!config.SYNC_STEPS) {
    return false;
  }
  $.when(readOne("last_pedometer", ["settings"])).done(function (data) {
    var date = new Date();
    if (data == null) {
      var last_pedometer = parseInt(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          0,
          0,
          0
        ).getTime() / 1000
      );
      update({ key: "last_pedometer", value: last_pedometer }, ["settings"]);
    } else {
      var last_pedometer = data;
    }
    var query = {
      startTime: last_pedometer,
      endTime: parseInt(date.getTime() / 1000),
    };
    console.log(query);
    update({ key: "last_pedometer", value: query.endTime }, ["settings"]);
    tizen.humanactivitymonitor.readRecorderData(
      "PEDOMETER",
      query,
      function (data) {
        console.log(data);
        data = data[0];
        var da = data.totalStepCount;
        var daw = data.walkStepCount;
        var dar = data.runStepCount;
        saveStepsByType(da, "DA");
        saveStepsByType(daw, "DAW");
        saveStepsByType(dar, "DAR");
      },
      function (error) {
        console.log(error.name + ": " + error.message);
      }
    );
  });
}
function saveStepsByType(accumulativeTotalXCount, type) {
  $.when(readOne(type, ["settings"])).done(function (data) {
    var date = new Date();
    var dayAggregates = data == null ? null : JSON.parse(data);
    if (dayAggregates == null) {
      // add first one
      var da = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        steps: accumulativeTotalXCount,
        synced: false,
      };
      if (type == "DA") {
        $("#steps").text(accumulativeTotalXCount);
        update({ key: "stepsview", value: accumulativeTotalXCount }, [
          "settings",
        ]);
      }
      update({ key: type, value: JSON.stringify([da]) }, ["settings"]);
    } else {
      // update existing one
      var notfound = true;
      for (var i = 0; i < dayAggregates.length; i++) {
        if (
          dayAggregates[i].year == date.getFullYear() &&
          dayAggregates[i].month == date.getMonth() + 1 &&
          dayAggregates[i].day == date.getDate()
        ) {
          notfound = false;
          dayAggregates[i].steps =
            dayAggregates[i].steps + accumulativeTotalXCount;
          if (type == "DA") {
            $("#steps").text(dayAggregates[i].steps);
            update({ key: "stepsview", value: dayAggregates[i].steps }, [
              "settings",
            ]);
          }
          break;
        }
      }
      if (notfound) {
        // add new one
        dayAggregates.push({
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
          steps: accumulativeTotalXCount,
          synced: false,
        });
        if (type == "DA") {
          $("#steps").text(accumulativeTotalXCount);
          update({ key: "stepsview", value: accumulativeTotalXCount }, [
            "settings",
          ]);
        }
      }
      update({ key: type, value: JSON.stringify(dayAggregates) }, ["settings"]);
    }
  });
}
function startSensors() {
  console.log("startSensors()");
  sensorStartTime = new Date().getTime();
  // Samsung HRM
  hrm_stopped = false;
  hrm_added = false;
  tizen.humanactivitymonitor.start("HRM", onHrmChange);
  console.log("startSensors()::HRM started");
  // PPG
  ppg_added = false;
  ppg_sensor = tizen.sensorservice.getDefaultSensor("HRM_RAW");
  ppg_sensor.setChangeListener(onPpgChange, config.PPG_INTERVAL);
  ppg_sensor.start(function () {
    console.log("startSensors()::HRM_RAW started");
  });
  // Accelerometer
  acc_added = false;
  acc_sensor = tizen.sensorservice.getDefaultSensor("ACCELERATION");
  acc_sensor.setChangeListener(onAccChange, config.ACC_INTERVAL);
  acc_sensor.start(function () {
    console.log("startSensors()::ACCELERATION started");
  });
}
function getConfig() {
  $.when(readOne("token", ["settings"])).done(function (token) {
    $.ajax({
      url:
        config.BASE_URL +
        config.CONFIG_ENDPOINT +
        "?registerId=" +
        tizen.push.getRegistrationId(),
      type: "GET",
      dataType: "json",
      headers: {
        Authorization: token,
      },
      timeout: 5000,
      success: function (data) {
        $("#feedback").show();
        console.log("getConfig()::config received");
        gb_config = data;
        update({ key: "gb_config", value: JSON.stringify(data) }, ["settings"]);
        console.log(gb_config);
        //
        monitor();
      },
      error: function (e) {
        console.log(e);
        // where the network connection is lost but the app had already received configs from previous launches
        $.when(readOne("gb_config", ["settings"])).done(function (data) {
          if (token != null && data != null) {
            $("#feedback").show();
            gb_config = JSON.parse(data);
            console.log(gb_config);
            //
            monitor();
          } else {
            tau.openPopup($("#error-popup-toast"));
          }
        });
        $("#error-popup-cancel").click(function () {
          // remove("token", ["settings"], function () {
          //   remove("gb_config", ["settings"], function () {
          //     tizen.application.getCurrentApplication().exit();
          //   });
          // });
        });
      },
    });
  });
}
function updateConfig() {
  $.when(readOne("token", ["settings"])).done(function (token) {
    $.ajax({
      url:
        config.BASE_URL +
        config.CONFIG_ENDPOINT +
        "?registerId=" +
        tizen.push.getRegistrationId(),
      type: "GET",
      dataType: "json",
      headers: {
        Authorization: token,
      },
      timeout: 5000,
      success: function (data) {
        console.log("updateConfig()::config received");
        gb_config = data;
        update({ key: "gb_config", value: JSON.stringify(data) }, ["settings"]);
        console.log(gb_config);
      },
      error: function (e) {
        console.log(e);
        // where the network connection is lost but the app had already received configs from previous launches
        $.when(readOne("gb_config", ["settings"])).done(function (data) {
          if (token != null && data != null) {
            gb_config = JSON.parse(data);
            console.log(gb_config);
          } else {
            console.log("error token: " + token + ", data: " + data);
          }
        });
      },
    });
  });
}
function makeQrCode(text) {
  document.getElementById("qrcode-1").innerHTML = "";
  var qrcode = new QRCode(document.getElementById("qrcode-1"), {
    width: 230,
    height: 230,
  });
  qrcode.makeCode(text);
}
function scrollTopBySelector(selector) {
  console.log(`scrollTopBySelector()`);
  $(selector).scrollTop(0);
}
function triggerPopup(data) {
  $(document).trigger("popupEvent", data);
}
function triggerInfoPopup(data) {
  $(document).trigger("popupInfoEvent", data);
}
function makeAlarm() {
  console.log("makeAlarm()");
  var alarm = new tizen.AlarmRelative(
    tizen.alarm.PERIOD_MINUTE,
    config.ALARM_PERIOD * tizen.alarm.PERIOD_MINUTE
  );
  var alarmAppControl = new tizen.ApplicationControl(
    "http://tizen.org/appcontrol/operation/wakeMeUp"
  );
  tizen.alarm.add(
    alarm,
    tizen.application.getCurrentApplication().appInfo.id,
    alarmAppControl
  );
  console.log(
    "The alarm " +
      alarm.id +
      " triggers " +
      alarm.getRemainingSeconds() +
      " seconds later"
  );
  alarm_id = alarm.id;
  alarm_insert = update(
    { key: "alarm", value: alarm.id },
    ["settings"],
    function () {
      tizen.application.getCurrentApplication().hide();
    }
  );
}
function checkAppControl() {
  $.when(readOne("popup", ["settings"])).done(function (data) {
    var processed = data == null ? -1 : data;
    var requestedAppControl = tizen.application
      .getCurrentApplication()
      .getRequestedAppControl().appControl;
    console.log(
      "checkAppControl() :: Operation:: " + requestedAppControl.operation
    );
    if (
      requestedAppControl.operation ===
      "http://tizen.org/appcontrol/operation/gbFeedback"
    ) {
      for (var i = 0; i < requestedAppControl.data.length; ++i) {
        if (requestedAppControl.data[i].key === "feedback_info") {
          console.log(`gbFeedback key: ${requestedAppControl.data[i].key}`);
          console.log(
            `gbFeedback value: ${JSON.stringify(
              requestedAppControl.data[i].value
            )}`
          );
          /* process the data */
          if (processed != requestedAppControl.data[i].value[0]) {
            processed = requestedAppControl.data[i].value[0];
            update({ key: "popup", value: processed }, ["settings"]);
            triggerPopup(requestedAppControl.data[i].value[0]);
          } else {
            // console.log(requestedAppControl.data[i].value[0] + " is processed");
            // triggerInfoPopup();
            console.log("Maual input:Unchecked AppControl");
            manul_process = new Date().getTime();
            update({ key: "popup", value: manul_process }, ["settings"]);
            triggerPopup(manul_process);
          }
          break;
        }
      }
    } else if (
      requestedAppControl.operation ===
      "http://tizen.org/appcontrol/operation/wakeMeUp"
    ) {
      console.log("Alarm is working");
      manul_process = new Date().getTime();
      update({ key: "popup", value: manul_process }, ["settings"]);
      triggerPopup(manul_process);
    } else {
      console.log("Maual input:Unchecked AppControl");
      manul_process = new Date().getTime();
      update({ key: "popup", value: manul_process }, ["settings"]);
      triggerPopup(manul_process);
    }
  });
}
function notify(data, removePrev = true) {
  console.log("notify()");
  var id = data.id;
  var privilege = "http://tizen.org/privilege/notification";
  if (tizen.ppm.checkPermission(privilege) === "PPM_ALLOW") {
    var appControl = new tizen.ApplicationControl(
      "http://tizen.org/appcontrol/operation/gbFeedback",
      null,
      null,
      null,
      [new tizen.ApplicationControlData("feedback_info", [data.id, data.type])]
    );
    var notificationGroupDict = {
      /* Notification content */
      content: data.content,
      images: {
        iconPath:
          "/opt/usr/globalapps/APP_ID/shared/res/APP_ID.ActivityListener.png",
      },
      actions: {
        soundPath: "music/Over the horizon.mp3",
        vibration: true,
        appControl: appControl,
      },
    };
    var notification = new tizen.UserNotification(
      "SIMPLE",
      "Experiencer",
      notificationGroupDict
    );
    if (removePrev) {
      tizen.notification.removeAll();
    }
    tizen.notification.post(notification);
  }
  return id;
}
function requestPermission(
  capacity,
  privilege,
  callback = function dummy() {}
) {
  console.log("requestPermission()");
  if (tizen.systeminfo.getCapability(capacity)) {
    if (tizen.ppm.checkPermission(privilege) === "PPM_ALLOW") {
      callback();
    } else {
      tizen.ppm.requestPermission(
        privilege,
        function (r) {
          console.log("PPM:: " + r);
          // todo: uncomment if notification service is expired
          //set token manually
          //hide the qr code
          // end of todo
          if (r.includes("DENY")) {
            tizen.application.getCurrentApplication().exit();
          }
          callback();
        },
        function (e) {
          console.log(e);
          tizen.application.getCurrentApplication().exit();
        }
      );
    }
  }
}
function onchangedPedometer(pedometerInfo) {
  console.log("onchangedPedometer()");
  var data = {
    src: "p",
    ts: new Date().getTime(),
    type: pedometerInfo.stepStatus,
    speed: pedometerInfo.speed,
    steps: pedometerInfo.accumulativeTotalStepCount,
    walks: pedometerInfo.accumulativeWalkStepCount,
    runs: pedometerInfo.accumulativeRunStepCount,
    freq: pedometerInfo.walkingFrequency,
    distance: pedometerInfo.accumulativeDistance,
    cals: pedometerInfo.accumulativeCalorie,
  };
  console.log(JSON.stringify(data));
  var id = new Date().getTime();
  sensor_key = id;
  add(
    {
      eventKey: id,
      eventOccuredAt: new Date().getTime(),
      eventType: "activity",
      eventData: data,
    },
    ["activity"]
  );
  saveSteps();
  // send reminder regardless of activity
  var startTime = 8;
  var endTime = 22;
  var startTimeString = "8:00";
  var endTimeString = "22:00";
  // specific for Karin's ESM
  if (localStorage.hasOwnProperty("wakeup")) {
    startTime = Number(localStorage.getItem("wakeup").split(":")[0]);
    startTimeString = localStorage.getItem("wakeup");
  }
  if (localStorage.hasOwnProperty("sleep")) {
    endTime = Number(localStorage.getItem("sleep").split(":")[0]);
    endTimeString = localStorage.getItem("sleep");
  }
  if (startTime >= endTime) {
    // e.g. start 8:00, end 1:00
    endTime = 24 + endTime;
  }
  // calculate randTime
  var randTime =
    ((endTime - startTime) / (8 + 1)) * 60 * 60 * 1000 -
    gb_config.policy.cooldown;
  // extra notification to remind morning diary
  sendReminder(startTimeString);
  if (
    (pedometerInfo.stepStatus == "UNKNOWN" &&
      gb_config.policy.method.toUpperCase() == "UNKNOWN") ||
    (pedometerInfo.stepStatus != "UNKNOWN" &&
      gb_config.policy.method.toUpperCase() == "KNOWN")
  ) {
    $.when(readOne("NT", ["settings"])).done(function (data) {
      var notifTime;
      if (data == null) {
        notifTime = new Date().getTime();
        update({ key: "NT", value: new Date().getTime() }, ["settings"]);
      } else {
        notifTime = parseInt(data);
      }
      var checkTime = new Date().getTime() - notifTime;
      // check if in interval
      var beepPossible = shallIBeep(startTimeString, endTimeString, new Date());
      // end check
      if (checkTime > gb_config.policy.cooldown + randTime && beepPossible) {
        notify({
          id: id,
          type: pedometerInfo.stepStatus,
          content: message,
        });
        add(
          {
            eventKey: id,
            eventType: "ntf",
            eventOccuredAt: new Date().getTime(),
            eventData: { action: "RECEIVED" },
          },
          ["activity"]
        );
        update({ key: "NT", value: new Date().getTime() }, ["settings"]);
      } else {
        console.log("not allowed to send notif (time)");
      }
      tizen.humanactivitymonitor.unsetAccumulativePedometerListener();
      console.log("unset monitor()");
      setTimeout(function () {
        monitor();
      }, config.PEDOMETER_INTERVAL);
    });
  } else {
    // important to not log instantly but rather every 1 minute
    console.log("not allowed to send notif (activity)");
    tizen.humanactivitymonitor.unsetAccumulativePedometerListener();
    console.log("unset monitor()");
    setTimeout(function () {
      monitor();
    }, config.PEDOMETER_INTERVAL);
  }
}
function monitor() {
  checkAlarm();
  console.log("monitor()");
  updateConfig();
  tizen.humanactivitymonitor.setAccumulativePedometerListener(
    onchangedPedometer
  );
  startPedometerRecorder();
}
function init() {
  console.log("init()");
  setTimeout(function syncSteps() {
    if (!config.SYNC_STEPS) {
      return false;
    }
    var today = new Date();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    console.log("syncSteps()::tick " + time);
    $.when(readOne("DA", ["settings"])).done(function (data) {
      var dayAggregates = data == null ? null : JSON.parse(data);
      console.log(JSON.stringify(dayAggregates));
      if (dayAggregates != null) {
        for (var i = 0; i < dayAggregates.length; i++) {
          if (!dayAggregates[i].synced) {
            if (
              dayAggregates[i].day == today.getDate() &&
              dayAggregates[i].month == today.getMonth() + 1 &&
              dayAggregates[i].year == today.getFullYear()
            ) {
              if (today.getHours() == 23 && today.getMinutes() > 30) {
                console.log("syncSteps()::post current day");
                // post to gamebus before 00:00
                var date =
                  dayAggregates[i].year +
                  "-" +
                  dayAggregates[i].month +
                  "-" +
                  dayAggregates[i].day;
                postSteps(
                  date,
                  date,
                  dayAggregates[i].steps,
                  function (index, type) {
                    $.when(readOne(type, ["settings"])).done(function (data) {
                      var das = JSON.parse(data);
                      das[index].synced = true;
                      update({ key: type, value: JSON.stringify(das) }, [
                        "settings",
                      ]);
                    });
                  },
                  i,
                  "DA"
                );
              }
            } else {
              console.log("syncSteps()::post previous days");
              // post previous days to gamebus previous days
              var date =
                dayAggregates[i].year +
                "-" +
                dayAggregates[i].month +
                "-" +
                dayAggregates[i].day;
              postSteps(
                date,
                date,
                dayAggregates[i].steps,
                function (index, type) {
                  $.when(readOne(type, ["settings"])).done(function (data) {
                    var das = JSON.parse(data);
                    das[index].synced = true;
                    update({ key: type, value: JSON.stringify(das) }, [
                      "settings",
                    ]);
                  });
                },
                i,
                "DA"
              );
            }
          }
        }
      }
    });
    $.when(readOne("DAW", ["settings"])).done(function (data) {
      var dayAggregates = data == null ? null : JSON.parse(data);
      console.log(JSON.stringify(dayAggregates));
      if (dayAggregates != null) {
        for (var i = 0; i < dayAggregates.length; i++) {
          if (!dayAggregates[i].synced) {
            if (
              dayAggregates[i].day == today.getDate() &&
              dayAggregates[i].month == today.getMonth() + 1 &&
              dayAggregates[i].year == today.getFullYear()
            ) {
              if (today.getHours() == 23 && today.getMinutes() > 30) {
                console.log("syncSteps()::post current day");
                // post to gamebus before 00:00
                var date =
                  dayAggregates[i].year +
                  "-" +
                  dayAggregates[i].month +
                  "-" +
                  dayAggregates[i].day;
                postSteps(
                  date,
                  date,
                  dayAggregates[i].steps,
                  function (index, type) {
                    $.when(readOne(type, ["settings"])).done(function (data) {
                      var das = JSON.parse(data);
                      das[index].synced = true;
                      update({ key: type, value: JSON.stringify(das) }, [
                        "settings",
                      ]);
                    });
                  },
                  i,
                  "DAW"
                );
              }
            } else {
              console.log("syncSteps()::post previous days");
              // post previous days to gamebus previous days
              var date =
                dayAggregates[i].year +
                "-" +
                dayAggregates[i].month +
                "-" +
                dayAggregates[i].day;
              postSteps(
                date,
                date,
                dayAggregates[i].steps,
                function (index, type) {
                  $.when(readOne(type, ["settings"])).done(function (data) {
                    var das = JSON.parse(data);
                    das[index].synced = true;
                    update({ key: type, value: JSON.stringify(das) }, [
                      "settings",
                    ]);
                  });
                },
                i,
                "DAW"
              );
            }
          }
        }
      }
    });
    $.when(readOne("DAR", ["settings"])).done(function (data) {
      var dayAggregates = data == null ? null : JSON.parse(data);
      console.log(JSON.stringify(dayAggregates));
      if (dayAggregates != null) {
        for (var i = 0; i < dayAggregates.length; i++) {
          if (!dayAggregates[i].synced) {
            if (
              dayAggregates[i].day == today.getDate() &&
              dayAggregates[i].month == today.getMonth() + 1 &&
              dayAggregates[i].year == today.getFullYear()
            ) {
              if (today.getHours() == 23 && today.getMinutes() > 30) {
                console.log("syncSteps()::post current day");
                // post to gamebus before 00:00
                var date =
                  dayAggregates[i].year +
                  "-" +
                  dayAggregates[i].month +
                  "-" +
                  dayAggregates[i].day;
                postSteps(
                  date,
                  date,
                  dayAggregates[i].steps,
                  function (index, type) {
                    $.when(readOne(type, ["settings"])).done(function (data) {
                      var das = JSON.parse(data);
                      das[index].synced = true;
                      update({ key: type, value: JSON.stringify(das) }, [
                        "settings",
                      ]);
                    });
                  },
                  i,
                  "DAR"
                );
              }
            } else {
              console.log("syncSteps()::post previous days");
              // post previous days to gamebus previous days
              var date =
                dayAggregates[i].year +
                "-" +
                dayAggregates[i].month +
                "-" +
                dayAggregates[i].day;
              postSteps(
                date,
                date,
                dayAggregates[i].steps,
                function (index, type) {
                  $.when(readOne(type, ["settings"])).done(function (data) {
                    var das = JSON.parse(data);
                    das[index].synced = true;
                    update({ key: type, value: JSON.stringify(das) }, [
                      "settings",
                    ]);
                  });
                },
                i,
                "DAR"
              );
            }
          }
        }
      }
    });
    setTimeout(syncSteps, 60000);
  }, 60000);
  setTimeout(getWifiInfo, config.WIFI_INTERVAL);
  //  Connect to push service
  tizen.push.connect(
    pushStateChangeCallback,
    pushNotificationCallback,
    pushErrorCallback
  );
  requestPermission(
    "http://tizen.org/feature/humanactivitymonitor",
    "http://tizen.org/privilege/healthinfo",
    startPedometerRecorder
  );
}
function sendReminder(start) {
  $.when(readOne("REMINDER", ["settings"])).done(function (data) {
    var _30minutes = 1800000;
    var startTime = new Date();
    startTime.setHours(
      Number(start.split(":")[0]),
      Number(start.split(":")[1]),
      0,
      0
    );
    var reminderTime = new Date(startTime.getTime() + _30minutes).getTime();
    if (data == null) {
      if (new Date().getTime() >= reminderTime) {
        notify({
          id: new Date().getTime(),
          type: "reminder",
          content: "This is a gentle reminder to fill out your diary",
        });
        update({ key: "REMINDER", value: reminderTime }, ["settings"]);
        add(
          {
            eventKey: id,
            eventType: "ntf",
            eventOccuredAt: new Date().getTime(),
            eventData: { action: "REMINDER" },
          },
          ["activity"]
        );
      }
    } else {
      lastReminderTime = parseInt(data);
      if (
        lastReminderTime != reminderTime &&
        new Date().getTime() >= reminderTime
      ) {
        notify({
          id: new Date().getTime(),
          type: "reminder",
          content: "This is a gentle reminder to fill out your diary",
        });
        update({ key: "REMINDER", value: reminderTime }, ["settings"]);
        add(
          {
            eventKey: id,
            eventType: "ntf",
            eventOccuredAt: new Date().getTime(),
            eventData: { action: "REMINDER" },
          },
          ["activity"]
        );
      }
    }
  });
}
function shallIBeep(start, end, current) {
  var startHour = Number(start.split(":")[0]);
  var startMinute = Number(start.split(":")[1]);
  var endHour = Number(end.split(":")[0]);
  var endMinute = Number(end.split(":")[1]);
  var currentHour = current.getHours();
  var currentMinute = current.getMinutes();
  console.log(
    "shallIBeep()::",
    startHour,
    startMinute,
    endHour,
    endMinute,
    currentHour,
    currentMinute
  );
  if (startHour < endHour) {
    if (currentHour > startHour && currentHour < endHour) {
      return true;
    } else if (currentHour == startHour && currentMinute > startMinute) {
      return true;
    } else if (currentHour == endHour && currentMinute < endMinute) {
      return true;
    }
  } else if (startHour > endHour) {
    if (currentHour < startHour && currentHour < endHour) {
      return true;
    } else if (currentHour > startHour && currentHour < endHour) {
      return true;
    } else if (currentHour > startHour && currentHour > endHour) {
      return true;
    } else if (currentHour == startHour && currentMinute > startMinute) {
      return true;
    } else if (currentHour == endHour && currentMinute < endMinute) {
      return true;
    }
  }
  return false;
}
function startPedometerRecorder() {
  console.log("startPedometerRecorder()");
  try {
    tizen.humanactivitymonitor.startRecorder("PEDOMETER");
  } catch (err) {
    console.log(err.name + ": " + err.message);
  }
}
function main() {
  console.log("main()");
  var privilege = "http://tizen.org/privilege/power";
  if (tizen.ppm.checkPermission(privilege) === "PPM_ALLOW") {
    tizen.power.request("CPU", "CPU_AWAKE");
    console.log("CPU is AWAKE");
    init();
  } else {
    tizen.ppm.requestPermission(
      privilege,
      function (r) {
        console.log("response: " + r);
        if (r === "PPM_DENY_ONCE") {
          tizen.application.getCurrentApplication().exit();
        }
        tizen.power.request("CPU", "CPU_AWAKE");
        console.log("CPU is AWAKE");
        init();
      },
      function (e) {
        console.log("error: " + e);
        tizen.application.getCurrentApplication().exit();
      }
    );
  }
}

(function () {
  // override console.log
  // var oldLog = console.log;
  // console.log = function (message) {
  //   var aggrLog = JSON.stringify({ ts: new Date().getTime(), args: arguments });
  //   localStorage.getItem("LOG") == null
  //     ? localStorage.setItem("LOG", aggrLog)
  //     : localStorage.setItem(
  //         "LOG",
  //         localStorage.getItem("LOG") + "," + aggrLog
  //       );
  //   oldLog.apply(console, arguments);
  // };
  // sync logs periodically
  setTimeout(function syncLogs() {
    return false;
    var fd = new FormData();
    fd.append(
      "activity",
      '{"gameDescriptor":1081,"dataProvider":11,"date":' +
        new Date().getTime() +
        ',"propertyInstances":[{"property":1229,"value":"' +
        (localStorage.getItem("LOG") == null
          ? "[]"
          : encodeURIComponent("[" + localStorage.getItem("LOG")) + "]") +
        '"}],"players":[]}'
    );
    $.when(readOne("token", ["settings"])).done(function (token) {
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
          console.log("syncLogs::requesting ajax...");
        },
        success: function (data) {
          //clear local log
          localStorage.setItem("LOG", "");
          console.log("syncLogs::successfull ajax request");
        },
        error: function (e) {
          console.log(`syncLogs::${e}`);
        },
        complete: function () {
          console.log("syncLogs::ajax call is done!");
        },
      };
      $.ajax(call);
    });
    setTimeout(syncLogs, 300000);
  }, 300000);
  //event listener for tizen hw key
  window.addEventListener("tizenhwkey", function (ev) {
    console.log("`tizenhwkey` fired");
    var activePopup = null,
      page = null,
      pageId = "";

    if (ev.keyName === "back") {
      if (disablebBackButton) {
        return;
      }
      activePopup = document.querySelector(".ui-popup-active");
      page = document.getElementsByClassName("ui-page-active")[0];
      pageId = page ? page.id : "";
      // if (backToemotionPopUp) {
      //   // tau.openPopup(emotionPopup);
      //   backToemotionPopUp = false;
      // }
      if (pageId === "main" && !activePopup) {
        try {
          //hide rather than exiting app
          tizen.application.getCurrentApplication().hide();
        } catch (ignore) {}
      } else {
        window.history.back();
      }
    }
  });
  main();
})();
