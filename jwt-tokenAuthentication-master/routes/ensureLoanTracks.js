const Loan = require('./models/Loan');
const LoanTrack = require('./models/LoanTrack');
const { createLoanTrack } = require('./createLoanTrack'); // Adjust path as needed

async function ensureLoanTracks() {
  try {
    const disbursedLoans = await Loan.find({ status: 'disbursed' });
    for (const loan of disbursedLoans) {
      const existingTrack = await LoanTrack.findOne({ loan: loan._id });
      if (!existingTrack) {
        console.log(`Creating LoanTrack for loan ${loan._id}`);
        await createLoanTrack(loan);
      } else {
        console.log(`LoanTrack already exists for loan ${loan._id}`);
      }
    }
    console.log('Finished ensuring LoanTracks for all disbursed loans');
  } catch (err) {
    console.error('Error ensuring LoanTracks:', err);
  }
}

ensureLoanTracks();