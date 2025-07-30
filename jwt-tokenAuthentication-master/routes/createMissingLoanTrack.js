const Loan = require('../models/Loan');
const LoanTrack = require('../models/LoanTrack');
const { createLoanTrack } = require('./createLoanTrack');

async function createMissingLoanTracks() {
  try {
    const disbursedLoans = await Loan.find({ status: 'disbursed' });
    for (const loan of disbursedLoans) {
      const existingTrack = await LoanTrack.findOne({ loan: loan._id });
      if (!existingTrack) {
        console.log(`Creating LoanTrack for loan ${loan._id}`);
        await createLoanTrack(loan);
      }
    }
    console.log('Finished creating missing LoanTracks');
  } catch (err) {
    console.error('Error creating missing LoanTracks:', err);
  }
}

createMissingLoanTracks();