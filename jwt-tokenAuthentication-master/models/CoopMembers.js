// models/CooperativeMember.js

const mongoose = require("mongoose");
const generateUniqueAppId = require("../utils/generateAppId");
const generateUniqueMemberId = require("../utils/generateMemberId");

const CooperativeMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  memberId: {
    type: String,
    unique: true,
    required: true
  },
   monthlySavings: {
    type: Number,
    required: true,
  },
  SavingsType: {
    type: String,
       enum: ['salary', 'card'],
    required: true,
  },
 accountNumber: { 
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid account number`
    },
    unique: true // Ensure account numbers are unique
  },
  bankName: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s]+$/.test(v); // Only letters and spaces
      },
      message: props => `${props.value} is not a valid bank name`
    }
  },
  phoneNumber: {
    type: String,
    required: true, 
    trim: true,
    validate: {
      validator: function(v) {
        // Nigerian phone number pattern
        return /^(\+234|0)[7-9][01]\d{8}$/.test(v);
      },
      message: props => `${props.value} is not a valid Nigerian phone number!`
    },
    unique: true // Ensure phone numbers are unique
  },
  appId: {
    type: String,
    unique: true,
    required: true
  },
  staffType: { 
    type: String, 
    required: true 
  },
  payMentProof: {
    type: String,
    required: true,
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  }
  ,
  verifiedAt: {
  type: Date,
  default: null
}
}, { timestamps: true },
);



// models/CoopMembers.js

CooperativeMemberSchema.pre("validate", async function (next) {
  if (!this.isNew) return next();

  //  Validate phone number
  const phoneRegex = /^(\+234|0)[7-9][01]\d{8}$/;
  if (!phoneRegex.test(this.phoneNumber)) {
    return next(new Error("Invalid Nigerian phone number"));
  }

  //  Check if user exists
  try {
    const user = await mongoose.model("User").findById(this.userId);
    if (!user) throw new Error("Referenced user does not exist");
  } catch (error) {
    return next(error);
  }

  // Generate IDs properly before calling next
  try {
    if (!this.memberId) {
      this.memberId = await generateUniqueMemberId();
    }

    if (!this.appId) {
      this.appId = await generateUniqueAppId();
    }

    return next(); //  Only call next after everything has run
  } catch (error) {
    return next(error); //  Don't swallow errors silently
  }
});


// CooperativeMemberSchema.pre("validate", async function(next) {
//   if (!this.isNew) return next();
  
//   // Phone Validation
//   const phoneRegex = /^(\+234|0)[7-9][01]\d{8}$/;
//   if (!phoneRegex.test(this.phoneNumber)) {
//     return next(new Error("Invalid Nigerian phone number"));
//   }
//   next();
//   // User Existence Check
//   try {
//     const user = await mongoose.model("User").findById(this.userId);
//     if (!user) throw new Error("Referenced user does not exist");
//   } catch (error) {
//     return next(error);
//   }

//   // ID Generation
//   try {
//     if (!this.memberId) {
//       this.memberId = await generateUniqueMemberId();
//     }
//     if (!this.appId) {
//       this.appId = await generateUniqueAppId();
//     }
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

CooperativeMemberSchema.pre("save", function (next) {
  if (this.isModified("isVerified") && this.isVerified && !this.verifiedAt) {
    this.verifiedAt = new Date();
  }
  next();
});
module.exports = mongoose.model("CooperativeMember", CooperativeMemberSchema);
