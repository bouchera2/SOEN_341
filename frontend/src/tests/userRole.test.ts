test('user role displays properly', () => {
  const user = { role: 'admin' };
  function getRoleLabel(u: { role: string }) { return u.role === 'admin' ? 'Admin' : 'User'; }
  expect(getRoleLabel(user)).toBe('Admin');
  expect(getRoleLabel({ role: 'user' })).toBe('User');
});

