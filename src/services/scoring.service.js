const KEYWORDS_EXCLUIDAS = [
    'proyecto',
    'proyectos',
    'venta',
    'apartaestudio en venta',
    'apartamento en venta',
    'sobre planos',
    'en construccion',
    'en construcción',
    'entrega futura',
    'fiducia',
    'preventa',
    'nuevo proyecto'
];

function normalizeText(text) {

    return (text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function includesAny(text, keywords) {

    return keywords.some(keyword =>
        text.includes(
            normalizeText(keyword)
        )
    );
}

function isBuiltApartment({
    titulo,
    descripcion,
    ubicacion
}) {

    const textoCompleto = normalizeText(
        [titulo, descripcion, ubicacion].join(' ')
    );

    const estaExcluido =
        includesAny(
            textoCompleto,
            KEYWORDS_EXCLUIDAS
        );

    return !estaExcluido;
}

function hasBasicListingQuality({
    precioNumerico,
    habitaciones,
    banos,
    area
}) {

    const precioValido =
        precioNumerico >= 700000 &&
        precioNumerico <= 20000000;

    const areaValida =
        !area || area >= 30;

    const habitacionesValidas =
        !habitaciones || habitaciones >= 1;

    const banosValidos =
        !banos || banos >= 1;

    return (
        precioValido &&
        areaValida &&
        habitacionesValidas &&
        banosValidos
    );
}

function hasReasonableDealPrice({
    precioNumerico,
    habitaciones,
    area
}) {

    if (precioNumerico <= 2500000) {

        return true;

    }

    if (
        precioNumerico <= 3500000 &&
        (area >= 55 || habitaciones >= 2)
    ) {

        return true;

    }

    if (
        precioNumerico <= 4500000 &&
        (area >= 75 || habitaciones >= 3)
    ) {

        return true;

    }

    return false;
}

function calculateOpportunityScore({
    titulo,
    descripcion,
    ubicacion,
    precioNumerico,
    habitaciones,
    banos,
    area
}) {

    let score = 0;

    const texto = normalizeText(
        [titulo, descripcion, ubicacion].join(' ')
    );

    if (texto.includes('metro')) score += 15;
    if (texto.includes('centro comercial')) score += 10;
    if (texto.includes('universidad')) score += 10;

    if (texto.includes('piscina')) score += 10;
    if (texto.includes('gym') || texto.includes('gimnasio')) score += 5;
    if (texto.includes('coworking')) score += 5;
    if (texto.includes('jacuzzi')) score += 10;
    if (texto.includes('terraza')) score += 5;
    if (texto.includes('balcon')) score += 5;
    if (texto.includes('amoblado')) score += 15;
    if (texto.includes('parqueadero')) score += 10;
    if (texto.includes('ascensor')) score += 5;
    if (texto.includes('porter') || texto.includes('vigilancia')) score += 5;

    if (texto.includes('nuevo')) score += 5;
    if (texto.includes('remodelado')) score += 10;
    if (texto.includes('lujo')) score += 5;
    if (texto.includes('iluminado')) score += 5;
    if (texto.includes('excelente estado')) score += 10;

    if (banos >= 2) score += 5;
    if (habitaciones >= 3) score += 5;
    if (area >= 70) score += 5;
    if (area >= 90) score += 5;

    if (precioNumerico > 0 && precioNumerico <= 1200000) {

        score += 35;

    } else if (precioNumerico <= 1800000) {

        score += 30;

    } else if (precioNumerico <= 2500000) {

        score += 22;

    } else if (precioNumerico <= 3500000) {

        score += 12;

    } else if (precioNumerico <= 5000000) {

        score += 5;

    } else if (precioNumerico >= 10000000) {

        score -= 15;

    } else if (precioNumerico >= 6000000) {

        score -= 8;

    }

    if (
        area >= 45 &&
        precioNumerico <= 2200000
    ) {

        score += 10;

    }

    if (
        area >= 60 &&
        precioNumerico <= 3000000
    ) {

        score += 8;

    }

    if (
        area >= 80 &&
        precioNumerico <= 4500000
    ) {

        score += 8;

    }

    if (
        area > 0 &&
        area < 35 &&
        precioNumerico > 1800000
    ) {

        score -= 8;

    }

    if (
        habitaciones >= 2 &&
        precioNumerico <= 2200000
    ) {

        score += 8;

    }

    if (
        habitaciones >= 3 &&
        precioNumerico <= 3000000
    ) {

        score += 10;

    }

    if (
        habitaciones === 1 &&
        precioNumerico > 2500000
    ) {

        score -= 5;

    }

    if (includesAny(texto, KEYWORDS_EXCLUIDAS)) {

        score -= 100;

    }

    if (score > 100) {

        score = 100;

    }

    if (score < 0) {

        score = 0;

    }

    return score;
}

module.exports = {
    calculateOpportunityScore,
    hasBasicListingQuality,
    hasReasonableDealPrice,
    isBuiltApartment
};
