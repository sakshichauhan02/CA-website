/**
 * Helper to get user subscription status from localStorage.
 * Used for simulated premium features across the application.
 */
export const getUserSubscription = () => {
  // Handle SSR: check if window is defined
  if (typeof window === 'undefined') {
    return { hasPro: false, hasMentor: false };
  }

  try {
    const subData = localStorage.getItem('active_subscription');
    if (!subData) {
      return { hasPro: false, hasMentor: false };
    }

    const { plan_type, status } = JSON.parse(subData);
    
    // Only return true if status is active
    if (status !== 'active') {
      return { hasPro: false, hasMentor: false };
    }

    return {
      hasPro: plan_type === 'pro',
      hasMentor: plan_type === 'mentor'
    };
  } catch (err) {
    console.error('Error reading subscription from localStorage:', err);
    return { hasPro: false, hasMentor: false };
  }
};
