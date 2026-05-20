const test = require('node:test');
const assert = require('node:assert/strict');

const {
    normalizeOpportunity
} = require('./opportunityNormalizer');

test('normalizeOpportunity builds a stable ingestion payload', () => {

    const normalized = normalizeOpportunity({
        titulo: 'Apartamento amoblado',
        precio: '$ 2.450.000',
        link: 'https://example.com/listing/1',
        descripcion: 'Cerca al metro',
        imagen: 'https://example.com/image.jpg',
        habitaciones: 2,
        banos: 2,
        area: 65,
        ubicacion: 'Medellin'
    });

    assert.equal(normalized.title, 'Apartamento amoblado');
    assert.equal(normalized.price, 2450000);
    assert.equal(normalized.originalUrl, 'https://example.com/listing/1');
    assert.deepEqual(normalized.images, ['https://example.com/image.jpg']);
    assert.equal(normalized.technicalDetails.area_m2, 65);
    assert.equal(normalized.technicalDetails.rooms, 2);
    assert.equal(normalized.technicalDetails.bathrooms, 2);
    assert.equal(normalized.technicalDetails.source, 'fincaraiz');
});
