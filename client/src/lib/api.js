const API_URL = 'https://ipcc-tiled-kfqigtyhr-dianas-projects-55ea9504.vercel.app';

/**
 * Calls the Vercel serverless function to transform the sentence.
 * @param {string} text
 * @param {'vocab'|'modality'|'transitivity'} feature
 * @param {'maintained'|'changed'|'omitted'} patternStatus
 */

export async function transformSentence(text, feature, patternStatus) {
    const response = await fetch(API_URL, {
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, feature, patternStatus})
    });

    if(!response.ok) {
        throw new Error('API error:' + response.status)
    };

    return response.json();
    
}