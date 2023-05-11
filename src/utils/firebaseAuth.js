import { getAuth, signOut, updateProfile } from 'firebase/auth';
import { alerts } from './sweetAlert';
export async function changeUserName(newName, callback) {
  callback();
  const auth = getAuth();
  await updateProfile(auth.currentUser, {
    displayName: newName,
  });
}

export async function handleSignOut() {
  const auth = getAuth();
  try {
    await signOut(auth);
    await alerts.titleOnly('Sign Out Successfully!', 'success');
    window.location.href = '/';
  } catch (err) {
    alerts.titleOnly('Something went wrong. Please try again later', 'error');
  }
}
