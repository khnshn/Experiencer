function downloadFromURL(url, successCallBack, location = "downloads") {
  var listener = {
    onprogress: function (id, receivedSize, totalSize) {
      console.log(
        "Received with id: " + id + ", " + receivedSize + "/" + totalSize
      );
    },

    onpaused: function (id) {
      console.log("Paused with id: " + id);
    },

    oncanceled: function (id) {
      console.log("Canceled with id: " + id);
    },

    oncompleted: function (id, fullPath) {
      console.log("Completed with id: " + id + ", full path: " + fullPath);
      successCallBack();
    },

    onfailed: function (id, error) {
      console.log("Failed with id: " + id + ", error name: " + error.name);
    },
  };
  var downloadRequest = new tizen.DownloadRequest(url, location);
  tizen.systeminfo.getPropertyValue("NETWORK", function (networkInfo) {
    if (networkInfo.networkType === "NONE") {
      console.log(
        "Network connection is not available. Download is not possible."
      );
      downloadRequest = null;
    } else {
      return tizen.download.start(downloadRequest, listener); // can be used to get state by tizen.download.getState(downloadId);
    }
  });
}
