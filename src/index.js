require('dotenv').config();

const {
    scrapeFincaRaiz
} = require('./scrapers/fincaRaizScraper');
const {
    normalizeOpportunity
} = require('./services/opportunityNormalizer');
const {
    ingestOpportunities,
    BACKEND_URL
} = require('./services/backendClient');

(async () => {

    console.log('Iniciando scraper...\n');

    const propiedadesCrudas =
        await scrapeFincaRaiz();

    console.log(
        `Publicaciones válidas recolectadas: ${propiedadesCrudas.length}`
    );

    if (!propiedadesCrudas.length) {

        console.log(
            'No se encontraron publicaciones válidas para ingerir.'
        );

        return;

    }

    const oportunidades =
        propiedadesCrudas
            .map(normalizeOpportunity)
            .filter(oportunidad =>
                oportunidad.title &&
                oportunidad.originalUrl &&
                Number.isFinite(oportunidad.price) &&
                oportunidad.price > 0
            );

    console.log(
        `Publicaciones normalizadas para backend: ${oportunidades.length}`
    );
    console.log(
        `Backend de ingestión: ${BACKEND_URL}\n`
    );

    if (!oportunidades.length) {

        console.log(
            'No quedó ninguna oportunidad válida después de normalizar.'
        );

        return;

    }

    const resultadoIngestion =
        await ingestOpportunities(oportunidades);

    console.log(
        `Ingestión completada. Recibidas: ${resultadoIngestion.received}, creadas: ${resultadoIngestion.created}, actualizadas: ${resultadoIngestion.updated}\n`
    );

    console.table(
        resultadoIngestion.items.map(item => ({
            status: item.status,
            bargain: item.bargain,
            score: item.investmentScore,
            link: item.originalUrl
        }))
    );

})().catch(error => {

    const detail =
        error.response?.data || error.message;

    console.error(
        'Falló la ejecución del scraper:',
        detail
    );

    process.exitCode = 1;
});
