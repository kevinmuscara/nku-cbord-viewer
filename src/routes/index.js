const multer = require('fastify-multer');
const upload = multer({ dest: 'src/uploads/' });
const parser = require('pdf2json');

const Routes = [
  {
    method: 'GET',
    url: '/',
    handler: async(req, res) => res.view('index.ejs')
  },
  {
    method: 'POST',
    url: '/',
    preHandler: upload.single('logs'),
    handler: async(req, res) => {
      let pdf = new parser();
      let filePath = req.file.path.replace('src\\', '');

      pdf.on('pdfParser_dataError', errData => console.error(errData.parserError));
      pdf.on('pdfParser_dataReady', pdfData => {
        let data = pdfData.Pages;
        let result = [];

        let name = decodeURIComponent(data[0].Texts[1]["R"][0]["T"]);
        let uni  = decodeURIComponent(data[0].Texts[0]["R"][0]["T"]);

        for(let i = 0; i < data.length; i++) {
          for(let j = 7; j < data[i].Texts.length - 11; j++) {
            result.push(decodeURIComponent(data[i].Texts[j]["R"][0]["T"]));
          }
        }

        let chunkSize = 4;
        let groups = result.map((e, i) => {
          return i % chunkSize === 0 ? result.slice(i, i + chunkSize) : null;
        }).filter(e => { return e; });

        res.view('stats.ejs', { name, uni, data: groups });
      });

      pdf.loadPDF(require('path').join(__dirname, '../', filePath));
    }
  }
];

module.exports = Routes;