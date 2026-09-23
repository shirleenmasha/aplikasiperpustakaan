import UserModel from '../models/UserModel';


async function login(username, password) {
  if (!username || !password) {
    throw new Error('Username dan password wajib diisi.');
  }

  const user = await UserModel.findByCredentials(username, password);
  if (!user) {
    throw new Error('Username atau password salah.');
  }

  return UserModel.saveSession(user);
}

async function logout() {
  await UserModel.clearSession();
  return true;
}


async function getCurrentUser() {
  return UserModel.getSession();
}

async function activateSubscription(userId) {
  const updated = await UserModel.updateUser(userId, { subscriptionActive: true });
  if (!updated) throw new Error('Akun tidak ditemukan.');
  
  return UserModel.saveSession(updated);
}

export default { login, logout, getCurrentUser, activateSubscription };
