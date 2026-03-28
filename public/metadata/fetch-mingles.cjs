const fs = require('fs');

// 1. CONFIGURATION
// Replace this with your actual folder CID (e.g., "QmYourCidGoesHere...")
const IPFS_CID = "QmcoeRsFYeHzPD9Gx84aKD3tjLUKjvPEMSmoPs2GQmHR1t"; 

// Using Cloudflare or Pinata as a gateway is usually faster than ipfs.io
const GATEWAY_URL = `https://cloudflare-ipfs.com/ipfs/${IPFS_CID}/`; 

const TOTAL_NFTS = 5555;
const BATCH_SIZE = 50; // How many to fetch at once to avoid rate limits

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchMinglesMetadata() {
    console.log(`Starting fetch for ${TOTAL_NFTS} Mingles...`);
    const masterData = {};

    for (let i = 1; i <= TOTAL_NFTS; i += BATCH_SIZE) {
        const batch = [];
        
        // Create a batch of promises
        for (let j = i; j < i + BATCH_SIZE && j <= TOTAL_NFTS; j++) {
            // NOTE: If your files don't have the .json extension, remove the ".json" below
            const url = `${GATEWAY_URL}${j}`; //.json 
            
            batch.push(
                fetch(url)
                    .then(res => {
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        return res.json();
                    })
                    .then(data => ({ id: j, data }))
                    .catch(err => {
                        console.error(`Failed to fetch #${j}:`, err.message);
                        return { id: j, data: null }; // Return null so the script doesn't crash
                    })
            );
        }

        // Wait for the entire batch to finish downloading
        console.log(`Fetching batch ${i} to ${Math.min(i + BATCH_SIZE - 1, TOTAL_NFTS)}...`);
        const results = await Promise.all(batch);

        // Add the results to our master dictionary
        results.forEach(item => {
            if (item.data) {
                masterData[item.id] = item.data;
            }
        });

        // Pause for a brief moment to be polite to the IPFS gateway
        await delay(1000); 
    }

    // Save the final object to a JSON file
    fs.writeFileSync('mingles-metadata.json', JSON.stringify(masterData, null, 2));
    console.log(`\n✅ Success! Saved ${Object.keys(masterData).length} items to mingles-metadata.json`);
}

fetchMinglesMetadata();