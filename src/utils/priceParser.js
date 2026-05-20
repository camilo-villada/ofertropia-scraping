function parsePrice(priceText) {

    if (!priceText) return 0;

    return Number(
        priceText
            .replace(/[^\d]/g, '')
    );

}

module.exports = {
    parsePrice
};
