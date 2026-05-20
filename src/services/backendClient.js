const axios = require('axios');

const BACKEND_URL =
    process.env.BACKEND_URL ||
    'http://localhost:8080/api/v1/opportunities/ingest';

async function ingestOpportunities(opportunities) {

    const response = await axios.post(
        BACKEND_URL,
        {
            opportunities
        },
        {
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );

    return response.data;
}

module.exports = {
    ingestOpportunities,
    BACKEND_URL
};
