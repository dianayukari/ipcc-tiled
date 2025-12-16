const API_URL = 'https://ipcc-tiled-7209h4ans-dianas-projects-55ea9504.vercel.app/api/transform';

/**
 * Calls the Vercel serverless function to transform the sentence.
 * @param {string} text
 * @param {'vocab'|'modality'|'transitivity'} feature
 * @param {'maintained'|'changed'|'omitted'} patternStatus
 * @param {string} abc_original
 */

export async function transformSentence(text, feature, patternStatus, abc_original) {
    const response = await fetch(API_URL, {
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, feature, patternStatus, abc_original})
    });

    if(!response.ok) {
        throw new Error('API error:' + response.status)
    };

    return response.json();
    
}