var config = {
  BASE_URL: "https://api.gamebus.eu/v2", //"https://api4.gamebus.eu/v2", //"http://192.168.0.106:8024/v2", //"https://api3.gamebus.eu/v2",
  CONFIG_ENDPOINT: "/wearables/tizen/config",
  ACITIVTY_ENDPOINT: "/activities?dryrun=false",
  SNOOZE_ENDPOINT: "/wearables/tizen/snooze",
  WIFI_INTERVAL: 60000,
  SENSOR_RECORDING: 120000,
  ALARM_PERIOD: 30,
  PPG_INTERVAL: 10,
  ACC_INTERVAL: 10,
  PEDOMETER_INTERVAL: 60000,
  TIZEN_PUSH: false,
  OVERRIDE_LOGGING: false,
  PREFIX: "file:///home/owner/media/Downloads/", // use this when model is downloaded from a URL
  BIN_URL: "OBSFUSCATED_TENSORFLOW_URL.bin",
  JSON_URL: "OBSFUSCATED_TENSORFLOW_URL.json",
  ML_THRESHOLD: 2,
  LESS: 1, // TODO: change to 1 for production and to anything else positive for testing
  OPPORTUNE_WINDOW: 60000, // if notification is reacted to within 1 minute
  DEBUG: false,
};
