const mongoose = require("mongoose");

async function generateUniqueAppId() {
  const CooperativeMember = mongoose.model("CooperativeMember");
  
  let appId;
  let existing;

  do {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    appId = `APP-${randomNum}`;
    existing = await CooperativeMember.findOne({ appId });
  } while (existing);

  return appId;
}

module.exports = generateUniqueAppId;