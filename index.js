const { chromium } = require('playwright');
const fs = require('fs');

(async () => {

    const browser = await chromium.launch({
        headless: false
    });

    const page = await browser.newPage();

    await page.goto(
        'https://www.fincaraiz.com.co/apartamentos/arriendo/medellin',
        {
            waitUntil: 'networkidle'
        }
    );

    // Esperar que carguen las tarjetas
    await page.waitForTimeout(5000);

    const apartamentos = await page.evaluate(() => {

        const cards = document.querySelectorAll('a');

        const resultados = [];

        cards.forEach(card => {

            const texto = card.innerText;

            if (
                texto.includes('$') &&
                texto.length > 20
            ) {

                resultados.push({
                    texto: texto,
                    link: card.href
                });

            }

        });

        return resultados.slice(0, 5);

    });

    // Guardar JSON
    fs.writeFileSync(
        'apartamentos.json',
        JSON.stringify(apartamentos, null, 2)
    );

    console.log(apartamentos);

    await browser.close();

})();