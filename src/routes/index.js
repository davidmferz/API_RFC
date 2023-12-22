const { Router } = require('express');
const router = Router();
const axios = require('axios');
const cheerio = require('cheerio');

router.get('/getRFC', async (req, res) => {
  
  try {

    console.log(req.query.rfc);
    const id=req.query.rfc
    const url ="https://siat.sat.gob.mx/app/qr/faces/pages/mobile/validadorqr.jsf?D1=10&D2=1&D3="+id;
    const scrapedData = await fetchData(url);

    // Combina los datos extraídos con los datos de Express
    const combinedData = {
      "RFC": scrapedData.RFC,
      "Regimen": getRegimen(scrapedData.Regimen),
      "Estado": scrapedData.Estado,
      "Municipio": scrapedData.Municipio,
      "Colonia": scrapedData.Colonia,
      "Direccion": scrapedData.Direccion,
      "Exterior": scrapedData.Exterior,
      "Interior": scrapedData.Interior,
      "CPostal": scrapedData.CPostal,
      "Email": scrapedData.Email,
      "Nombre": scrapedData.Nombre
    };

    res.json(combinedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const objJSON = {};

    // Obtener RFC
    const ElemRFC = $('li').first();
    let RFC = ElemRFC.text();
    const iend = RFC.indexOf(",");
    RFC = RFC.substring(8, iend);
    objJSON['RFC'] = RFC;

    // Obtener Régimen Fiscal
    //const Regimen = getRegimen($('table').eq(7).text());
    //objJSON['Regimen'] = Regimen;

    // Obtener dirección
    const tablaDir = $('table').eq(4);
    const tdDir = tablaDir.find('td');
    objJSON['Estado'] = tdDir.eq(1).text();
    objJSON['Municipio'] = tdDir.eq(3).text();
    objJSON['Colonia'] = tdDir.eq(5).text();
    objJSON['Direccion'] = tdDir.eq(9).text();
    objJSON['Exterior'] = tdDir.eq(11).text();
    objJSON['Interior'] = tdDir.eq(13).text();
    objJSON['CPostal'] = tdDir.eq(15).text();
    objJSON['Email'] = tdDir.eq(17).text();

    // Obtener Nombre
    const tablaNombre = $('table').eq(1);
    const tdNombre = tablaNombre.find('td');
    const Nombre = tablaNombre.text();
    if (Nombre.includes('CURP')) {
      objJSON['Nombre'] = `${tdNombre.eq(3).text()} ${tdNombre.eq(5).text()} ${tdNombre.eq(7).text()}`;
    } else {
      objJSON['Nombre'] = tdNombre.eq(1).text();
    }

    return objJSON;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Función para obtener el código de régimen fiscal
const getRegimen = (regimenText) => {
  const regimenes = {
    // Mapea los textos de régimen a sus códigos
  };

  // Lógica para asignar el código de régimen según el texto
  // Puedes adaptar esto según los regímenes específicos que manejas

  return regimenes[regimenText] || 'CódigoNoEncontrado';
};

module.exports = router;
