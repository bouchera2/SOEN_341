test('QR code text is constructed from email', () => {
  function getQRCodeValue(email: string) { return `Ticket for ${email}`; }
  expect(getQRCodeValue('student@mail.com')).toBe('Ticket for student@mail.com');
});

