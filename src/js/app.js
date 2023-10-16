/*
 * Global variables
 */
var message = "Please click on `open app` below first and then `Self-report`";
var backToemotionPopUp = false;
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
var emotionPopup = document.getElementById("emotion-popup");
var intensityPopup = document.getElementById("intensity-popup");
var wastedPopup = document.getElementById("wasted-popup");
var colorsPopup = document.getElementById("colors-popup");
// var addEmotionPopup = document.getElementById("add-emotion-popup");
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
//ggz centraal
colorsPopup.addEventListener("popupbeforeshow", function () {
  colorSlider.value(colorValue == -1 ? 6 : colorValue);
  var color = "black";
  var location = "";
  switch (colorValue) {
    case 1:
      location = "RONDA";
      break;
    case 2:
      location = "PANDORA";
      break;
    case 3:
      location = "KF HEIN FOYER";
      break;
    case 4:
      location = "PLEIN 6";
      break;
    case 5:
      location = "DE PUNT";
      break;
    case 6:
      location = "HERTZ";
      break;
    case 7:
      location = "CLOUD NINE";
      break;
    case 8:
      location = "DE PIT";
      break;
    case 9:
      location = "Slachthuis";
      break;
    case 10:
      location = "CLUB NINE";
      break;
    case 11:
      location = "Other";
      break;
    default:
      location = "HERTZ";
      color = "black";
  }
  $("#colors-popup").css("background-color", color);
  $("#location-name").text(location);
});
//
emotionPopup.addEventListener("popupbeforeshow", function () {
  //ggz centraal
  valenceSlider.value(emotion == -1 ? "5" : String(emotion));
  //
  console.log("`popupbeforeshow` fired");
  //remove li(s)
  // $(".my-emotion").remove();
  // //add emotions
  // $.when(readOne("EM", ["settings"])).done(function (raw_emotions) {
  //   var emotions = raw_emotions == null ? [] : JSON.parse(raw_emotions);
  //   for (var i = 0; i < emotions.length; i++) {
  //     $(".pre-list").prepend(
  //       `<li class="my-emotion"><a data-rel="popup" href="#intensity-popup" onclick="manulEmotionClick('${emotions[i]}')">${emotions[i]}</a></li>`
  //     );
  //   }
  // });
});
emotionPopup.addEventListener("popupshow", function () {
  console.log("`popupshow` fired");
  // re-enable back button
  disablebBackButton = false;
  add(
    {
      eventKey: Number($("#process-id").val()),
      eventType: "ntf",
      eventOccuredAt: new Date().getTime(),
      eventData: { action: "READ" },
    },
    ["activity"]
  );
  $(".ui-popup-wrapper").scrollTop(0);
});
preparingPopup.addEventListener("popupbeforeshow", function () {
  console.log("`popupbeforeshow` fired");
  // disable back press
  disablebBackButton = true;
  // start sensors
  sensorForceStop = false;
  startSensors();
});
// addEmotionPopup.addEventListener("popupbeforeshow", function () {
//   console.log("`popupbeforeshow` fired");
//   backToemotionPopUp = true;
// });
intensityPopup.addEventListener("popupbeforeshow", function () {
  //ggz centraal
  arousalSlider.value(intensity == -1 ? "5" : String(intensity));
  //
  console.log("`popupbeforeshow` fired");
  backToemotionPopUp = true;
});
intensityPopup.addEventListener("popupshow", function () {
  console.log("`popupshow` fired");
  $(".ui-popup-wrapper").scrollTop(0);
});
wastedPopup.addEventListener("popupbeforeshow", function () {
  //ggz centraal
  wastedSlider.value(wasted == -1 ? "5" : String(wasted));
  //
  console.log("`popupbeforeshow` fired");
  backToemotionPopUp = true;
});
wastedPopup.addEventListener("popupshow", function () {
  console.log("`popupshow` fired");
  $(".ui-popup-wrapper").scrollTop(0);
});
$(document).on("popupEvent", { type: "UI" }, function (event, data) {
  $("#process-id").val(data);
  tau.openPopup(preparingPopup);
  setTimeout(() => {
    tau.closePopup(preparingPopup);
    tau.openPopup(emotionPopup);
  }, 3000);
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
$(document).on("snoozeEvent", { type: "UI" }, function (event, data) {
  console.log("`snoozeEvent` for " + $("#process-id").val() + " fired");
  // to later send to notification endpoint
  add(
    {
      eventKey: Number($("#process-id").val()),
      eventType: "snz",
      eventOccuredAt: new Date().getTime(),
      eventData: {},
    },
    ["activity"]
  );
  // to later send as an activity
  add(
    {
      eventKey: Number($("#process-id").val()),
      eventType: "ntf",
      eventOccuredAt: new Date().getTime(),
      eventData: { action: "SNOOZED" },
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
        { eventKey: sensor_key, eventType: "hrm", eventData: hrm_array },
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
        { eventKey: sensor_key, eventType: "raw", eventData: ppg_array },
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
        { eventKey: sensor_key, eventType: "acc", eventData: acc_array },
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
          "/opt/usr/globalapps/NDLfqWiZ8Z/shared/res/NDLfqWiZ8Z.ActivityListener.png",
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
function onchangedHrm(hrmInfo) {
  if (!canSetMonitor) {
    return;
  }
  // console.log(
  //   `{"hr":${hrmInfo.heartRate},"ppi":${
  //     hrmInfo.rRInterval
  //   },"ts":${new Date().getTime()}}`
  // );
  console.log("recording HRM");
  hrmCounter++;
  if (hrmCounter == 300) {
    console.log("stopping HRM");
    /* Stop the sensor after detecting a few changes */
    tizen.humanactivitymonitor.stop("HRM");
    if (canSetMonitor) {
      canSetMonitor = false;
      console.log("call monitor() after 1 minute");
      setTimeout(function () {
        monitor();
      }, 60000);
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
  add({ eventKey: id, eventType: "activity", eventData: data }, ["activity"]);
  // saveSteps();
  if (
    (pedometerInfo.stepStatus === "NOT_MOVING" &&
      gb_config.policy.method === "SMART") ||
    (((pedometerInfo.stepStatus == "UNKNOWN" && pedometerInfo.speed > 10) ||
      pedometerInfo.stepStatus == "RUNNING" ||
      pedometerInfo.stepStatus == "WALKING") &&
      gb_config.policy.method === "STUPID") ||
    gb_config.policy.method === "FIXED_INTERVAL"
  ) {
    $.when(readOne("NT", ["settings"])).done(function (data) {
      var notifTime;
      if (data == null) {
        notifTime = new Date().getTime();
        update({ key: "NT", value: new Date().getTime() }, ["settings"]);
      } else {
        notifTime = parseInt(data);
      }
      if (new Date().getTime() - notifTime > gb_config.policy.cooldown) {
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
  //todo: remove the code below
  setTimeout(function () {
    $("#qrcodes").hide();
    $("#feedback").show();
  }, 2000);
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
      if (backToemotionPopUp) {
        tau.openPopup(emotionPopup);
        backToemotionPopUp = false;
      }
      if (pageId === "main" && !activePopup) {
        try {
          //   tizen.application.getCurrentApplication().exit();
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
