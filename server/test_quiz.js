import fetch, { FormData, Blob } from 'node-fetch';
import PDFDocument from 'pdfkit';
import fs from 'fs';

function generatePDF() {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    doc.text('1. Question 1?');
    doc.text('A) Opt A');
    doc.text('B) Opt B');
    doc.text('C) Opt C');
    doc.text('D) Opt D');
    doc.text('Answer: A');
    doc.end();
  });
}

async function run() {
  const fileBuffer = await generatePDF();
  
  const formData = new FormData();
  formData.append('pdf', new Blob([fileBuffer]), 'test.pdf');
  
  const res = await fetch('http://localhost:5000/api/upload-quiz/parse-pdf', {
     method: 'POST',
     body: formData
  });
  
  console.log(res.status);
  console.log(await res.text());
}

run();
