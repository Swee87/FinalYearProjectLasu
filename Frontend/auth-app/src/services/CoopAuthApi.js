export const VerifyLasuStaff = async (profileNumber) => {
  try {
    const response = await fetch("http://localhost:5000/CoopAuth/verify-lasu-profile", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profileNumber }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const {profile} = await response.json();
    return profile; // Return the profile data
  } catch (error) {
    console.error('Error verifying LASU staff:', error);
    throw error;
  }
}