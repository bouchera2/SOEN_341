import express from 'express';
import { Parser } from 'json2csv';

const app = express();

app.get('/', (req, res) => {
  const name = process.env.NAME || 'World';
  res.send(`Hello ${name}!`);
});

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

async function fetchStudents() {
  // Replace with actual DB call
  return [
    { name: "Alice", studentId: "123", email: "alice@example.com" },
    { name: "Bob", studentId: "456", email: "bob@example.com" }
  ];
}

app.get('/download-csv', async (req, res) => { // Endpoint to download CSV
  const students = await fetchStudents(); // Data as JSON
  const fields = ['name', 'studentId', 'email'];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(students);

  res.header('Content-Type', 'text/csv');
  res.attachment('students.csv');
  res.send(csv);
});

//when passing data to a function, make it json format

//name, student id, student email