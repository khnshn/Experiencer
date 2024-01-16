const loadModelFS = async function (path) {
  return await tf.loadLayersModel(path);
};

const loadModelIDB = async function (name) {
  return await tf.loadLayersModel("indexeddb://" + name);
};

const saveModelIDB = async function (model, name) {
  await model.save("indexeddb://" + name);
};
