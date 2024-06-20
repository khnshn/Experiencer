var config = {
  BASE_URL: "https://api.gamebus.eu/v2", //"https://api4.gamebus.eu/v2", //"http://192.168.0.106:8024/v2", //"https://api3.gamebus.eu/v2",
  CONFIG_ENDPOINT: "/wearables/tizen/config",
  ACITIVTY_ENDPOINT: "/activities?dryrun=false",
  SNOOZE_ENDPOINT: "/wearables/tizen/snooze",
  WIFI_INTERVAL: 300000, // was 60000, changed for battery test
  SENSOR_RECORDING: 60000, // was 120000, changed for battery test
  ALARM_PERIOD: 30,
  PPG_INTERVAL: 10,
  ACC_INTERVAL: 10,
  PEDOMETER_INTERVAL: 60000,
  TIZEN_PUSH: false,
  OVERRIDE_LOGGING: false,
  PREFIX: "file:///home/owner/media/Downloads/", // use this when model is downloaded from a URL
  BIN_URL:
    "https://experiencer.eu/wp-content/uploads/2023/07/group1-shard1of1.bin",
  JSON_URL: "https://experiencer.eu/wp-content/uploads/2023/07/model.json",
  ML_THRESHOLD: 2,
  LESS: 1, // TODO: change to 1 for production and to anything else positive for testing
  OPPORTUNE_WINDOW: 60000, // if notification is reacted to within 1 minute
  DEBUG: false,
  GPS_EXAMPLE: JSON.parse(
    '{"gps":{"callback_interval":150000,"sample_interval":1000,"geofencing":[{"lat":200,"long":200,"r":1,"message":"hello 200,200","cooldown":60000},{"lat":0,"long":0,"r":1,"message":"hi 0,0","cooldown":60000}],"gd_tk":"gd_tk","prp_lat":"prp_lat","prp_long":"prp_long","prp_alt":"prp_alt","prp_speed":"prp_speed","prp_error":"prp_error","prp_ts":"prp_ts"}}'
  ),
};
