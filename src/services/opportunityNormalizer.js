const {
    parsePrice
} = require('../utils/priceParser');

function normalizeOpportunity(rawOpportunity) {

    const price =
        parsePrice(rawOpportunity.precio);

    return {
        title: rawOpportunity.titulo,
        currency: 'COP',
        price,
        originalUrl: rawOpportunity.link,
        description: rawOpportunity.descripcion || null,
        images: rawOpportunity.imagen
            ? [rawOpportunity.imagen]
            : [],
        technicalDetails: {
            area_m2: rawOpportunity.area || null,
            rooms: rawOpportunity.habitaciones || null,
            bathrooms: rawOpportunity.banos || null,
            parking: rawOpportunity.parqueaderos || 0,
            location_label: rawOpportunity.ubicacion || null,
            source: 'fincaraiz',
            source_price_text: rawOpportunity.precio || null
        },
        active: true
    };
}

module.exports = {
    normalizeOpportunity
};
