// utils/generateMemberId.js
const mongoose = require("mongoose");

async function generateUniqueMemberId() {
  const CooperativeMember = mongoose.model("CooperativeMember");
  
  let memberId;
  let existing;
  
  do {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    memberId = `GBEWA/${randomNum}`;
    existing = await CooperativeMember.findOne({ memberId });
  } while (existing);

  return memberId;
}

module.exports = generateUniqueMemberId;