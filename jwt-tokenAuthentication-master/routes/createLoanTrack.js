// const LoanTrack = require('../models/LoanTrack');

// const createLoanTrack = async (loan) => {
//   try {
//     const disbursedDate = loan.disbursed_at || new Date();
//     const payments = [];
    
//     for (let i = 1; i <= loan.repayment; i++) {
//       const paymentDate = new Date(disbursedDate);
//       paymentDate.setMonth(disbursedDate.getMonth() + i);
      
//       payments.push({
//         month: paymentDate.toLocaleString('default', { month: 'long' }),
//         year: paymentDate.getFullYear(),
//         counter: i,
//         paidPerMonth: false
//       });
//     }
    
//     return await LoanTrack.create({
//       loan: loan._id,
//       payments
//     });
//   } catch (err) {
//     console.error('Error creating loan track:', err);
//     throw err;
//   }
// };

// module.exports = { createLoanTrack };

const Loan = require('../models/Loan');
const CooperativeMember = require('../models/CoopMembers');
const LoanTrack = require('../models/LoanTrack');

const createLoanTrack = async (loan) => {
  try {
    const disbursedDate = loan.disbursed_at || new Date();
    const payments = [];

    for (let i = 1; i <= loan.repayment; i++) {
      const paymentDate = new Date(disbursedDate);
      paymentDate.setMonth(disbursedDate.getMonth() + i);

      payments.push({
        month: paymentDate.toLocaleString('default', { month: 'long' }),
        year: paymentDate.getFullYear(),
        counter: i,
        paidPerMonth: false
      });
    }

    // Fetch the CooperativeMember to get the userId
    const coopMember = await CooperativeMember.findById(loan.member);
    if (!coopMember || !coopMember.userId) {
      throw new Error(`No associated user found for loan member ${loan.member}`);
    }

    return await LoanTrack.create({
      loan: loan._id,
      payments,
      userDetails: coopMember.userId 
    });
  } catch (err) {
    console.error('Error creating loan track:', err);
    throw err;
  }
};

module.exports = { createLoanTrack };
