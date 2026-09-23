export const ROLES = {
  MAHASISWA: 'mahasiswa',
  ADMIN: 'admin',       
  EKSTERNAL: 'eksternal',
};

export const ROLE_LABELS = {
  [ROLES.MAHASISWA]: 'Mahasiswa',
  [ROLES.ADMIN]: 'Pengurus Perpustakaan',
  [ROLES.EKSTERNAL]: 'Pengguna Umum',
};


export const PERMISSIONS = {
  [ROLES.MAHASISWA]: {
    manageBooks: false,    
    viewDashboard: false,  
    borrowBook: true,      
    accessJournal: true,   
    maxBorrow: 5,          
    needsPayment: false,   
  },
  [ROLES.ADMIN]: {
    manageBooks: true,
    viewDashboard: true,
    borrowBook: true,
    accessJournal: true,
    maxBorrow: 10,
    needsPayment: false,
  },
  [ROLES.EKSTERNAL]: {
    manageBooks: false,
    viewDashboard: false,
    borrowBook: true,
    accessJournal: false, 
    maxBorrow: 2,          
    needsPayment: true,    
  },
};

export function can(user, permission) {
  if (!user) return false;
  const rules = PERMISSIONS[user.role];
  return rules ? !!rules[permission] : false;
}

export function getRules(user) {
  if (!user) return null;
  return PERMISSIONS[user.role] || null;
}
