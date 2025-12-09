import { Event } from '../index';

test('Event object matches required interface', () => {
  const event: Event = {
    id: 'evt-01',
    title: 'Hackathon',
    description: 'A fun hackathon!',
    date: new Date('2024-01-01'),
    location: 'Concordia',
    capacity: 50,
    price: 0,
    createdBy: 'org-01'
  };
  expect(event.title).toBe('Hackathon');
  expect(typeof event.capacity).toBe('number');
});

