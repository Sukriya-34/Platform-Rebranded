const { createRequire } = require('module');
const requireCustom = createRequire(__filename);
const pdfParse = requireCustom('pdf-parse');

const PDFDocument = requireCustom('pdfkit');

const doc = new PDFDocument();
const buffers = [];
doc.on('data', buffers.push.bind(buffers));
doc.on('end', async () => {
    const fileBuffer = Buffer.concat(buffers);
    try {
      const data = await pdfParse(fileBuffer);
      console.log('SUCCESS TEXT:', data.text);
    } catch(e) {
      console.error('DIRECT PDF PARSE ERROR:', e);
    }
});
doc.text('1. Question 1?');
doc.text('A) Opt A');
doc.text('B) Opt B');
doc.text('C) Opt C');
doc.text('D) Opt D');
doc.text('Answer: A');
doc.end();
