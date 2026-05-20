const axios = require('axios');

const {
    hasBasicListingQuality,
    isBuiltApartment
} = require('../services/scoring.service');

const FINCA_RAIZ_URL =
    'https://www.fincaraiz.com.co/arriendo/apartamentos/medellin/antioquia';

function cleanText(value) {

    return (value || '')
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, '\'')
        .replace(/\s+/g, ' ')
        .trim();
}

function extractMatch(text, pattern) {

    const match = text.match(pattern);

    return match ? cleanText(match[1]) : '';
}

function parseNumber(value) {

    const digits = (value || '')
        .replace(/[^\d]/g, '');

    return digits ? Number(digits) : 0;
}

function extractTypology(block) {

    const items = [
        ...block.matchAll(
            /lc-typologyTag__item[\s\S]*?<strong>([\s\S]*?)<\/strong>/g
        )
    ].map(match =>
        cleanText(match[1])
    );

    let habitaciones = 0;
    let banos = 0;
    let area = 0;

    items.forEach(item => {

        const normalized = item.toLowerCase();

        if (normalized.includes('hab')) {

            habitaciones = parseNumber(item);

        } else if (normalized.includes('ba')) {

            banos = parseNumber(item);

        } else if (
            normalized.includes('m²') ||
            normalized.includes('m2')
        ) {

            area = parseNumber(item);

        }

    });

    return {
        habitaciones,
        banos,
        area
    };
}

function extractListingsFromHtml(html) {

    const blocks = html
        .split('<div class="listingCard')
        .slice(1);

    return blocks.map(block => {

        const titulo = extractMatch(
            block,
            /<h2 class="lc-title[^"]*">([\s\S]*?)<\/h2>/
        );

        const precio = extractMatch(
            block,
            /<p class="main-price">([\s\S]*?)<\/p>/
        );

        const ubicacion = extractMatch(
            block,
            /<strong class="lc-location[^"]*">([\s\S]*?)<\/strong>/
        );

        const descripcion = extractMatch(
            block,
            /<p class="lc-description">([\s\S]*?)<\/p>/
        );

        const link =
            block.match(
                /<a class="lc-data"[^>]*href="([^"]+)"/
            )?.[1] || '';

        const imagen =
            block.match(/<img src="([^"]+)"/)?.[1] || '';

        const {
            habitaciones,
            banos,
            area
        } = extractTypology(block);

        return {
            titulo,
            precio,
            ubicacion,
            descripcion,
            habitaciones,
            banos,
            area,
            parqueaderos: /parqueadero/i.test(block) ? 1 : 0,
            link: link.startsWith('http')
                ? link
                : `https://www.fincaraiz.com.co${link}`,
            imagen
        };

    }).filter(propiedad =>
        propiedad.titulo &&
        propiedad.precio
    );
}

async function scrapeFincaRaiz() {

    try {

        const response = await axios.get(
            FINCA_RAIZ_URL,
            {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    Accept:
                        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                },
                timeout: 60000
            }
        );

        const propiedadesRaw =
            extractListingsFromHtml(response.data);

        const propiedades = propiedadesRaw.map(propiedad => {
            const esApartamentoConstruido =
                isBuiltApartment(propiedad);

            const precioNumerico =
                Number(
                    (propiedad.precio || '')
                        .replace(/[^\d]/g, '')
                );

            const cumpleValidacionBasica =
                hasBasicListingQuality({
                    precioNumerico,
                    habitaciones: propiedad.habitaciones,
                    banos: propiedad.banos,
                    area: propiedad.area
                });

            return {
                ...propiedad,
                precioNumerico,
                esApartamentoConstruido,
                cumpleValidacionBasica
            };

        }).filter(propiedad =>
            propiedad.esApartamentoConstruido &&
            propiedad.cumpleValidacionBasica &&
            propiedad.link
        );

        return propiedades.slice(0, 20);

    } catch (error) {

        console.error(
            'Error scraping FincaRaiz:',
            error.message
        );

        return [];

    }

}

module.exports = {
    scrapeFincaRaiz,
    extractListingsFromHtml
};
