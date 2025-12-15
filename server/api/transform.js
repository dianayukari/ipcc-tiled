import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY })

export default async function handler(req,res) {

    if (req.method != 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed. Use POST.'
        });
    }

    try {
        const { text, feature, patternStatus } = req.body;

        if (!text || !feature) {
            return res.status(400).json({
                error: "Missing text or type"
            });
        }

        const allowedFeatures = ['vocab', 'transitivity', 'modality'];
        const allowedPatterns = ['maintained', 'changed', 'omitted'];

        if (!allowedFeatures.includes(feature)) {
            return res.status(400).json({ error: 'Invalid feature' });
        }
        if (patternStatus && !allowedPatterns.includes(patternStatus)) {
            return res.status(400).json({ error: 'Invalid patternStatus'});
        }

        const featureExplanation = {
            vocab: `Rephrase the sentence by changing lexical choices (nouns, verbs, adjectives, and expressions) while preserving the original meaning, scope, and factual content.
            Use synonyms or near-synonyms where possible.
            Avoid repeating the same key words and phrasing from the original sentence.
            Do not add, remove, or reinterpret information.
            Do not simplify the sentence or change its technical register unless required by the pattern.`,
            modality: `Apply a modality transformation.
            Rephrase the sentence by changing how certainty, probability, or expectation is expressed linguistically.
            Use different modal verbs, adverbs, or constructions (e.g. implicit vs explicit modality).
            Preserve the underlying claim, time frame, and direction of effects.
            Do not alter factual content.`,
            transitivity: `Apply a transitivity transformation.
            Rephrase the sentence by changing grammatical agency, voice, or process structure.
            You may shift between active and passive voice, foreground or background agents, or replace actions with nominalized processes.
            Do not introduce new agents or remove existing ones.
            Do not change the meaning of the event or process described.`
        }[feature];

        const patternInstruction = {
            maintained: `Maintain IPCC calibrated language.
            Preserve all IPCC likelihood and confidence expressions exactly as written (e.g. "likely", "very likely", "high confidence").
            Do not paraphrase, reinterpret, weaken, or strengthen these expressions.
            Ensure they appear in the transformed sentence in the same semantic role.`,
            omitted: `Omit IPCC calibrated language.
            Remove all explicit IPCC likelihood and confidence expressions from the sentence.
            Do not replace them with alternative probability or uncertainty terms.
            Ensure the remaining sentence is grammatically complete and preserves the core claim`,
            changed: `Change IPCC calibrated language.
            Replace IPCC likelihood and confidence expressions with non-standard, qualitative uncertainty formulations.
            Preserve the approximate strength of certainty without using IPCC-calibrated terms.
            Do not remove uncertainty entirely and do not intensify or weaken the claim.`
        }[patternStatus || 'maintained']

        const completion = await openai.chat.completions.create({
            model: 'gpt-5.1-mini',
            messages: [
                {
                    role: 'user',
                    content:`
                    You are performing an intralingual translation of an IPCC statement.

                    Follow the instructions exactly.
                    Preserve meaning, scope, and factual content.
                    Output only the transformed sentence.
                    The result should sound like a sentence that might be used by a specific actor (NGO, ministry, lobby, etc.).

                    Original statement: 
                    "${text}"

                    Feature to change: ${feature}
                    Feature instruction: ${featureExplanation}

                    Pattern status: ${patternStatus || 'maintained'}
                    Pattern instruction: ${patternInstruction}

                    Produce the transformed sentence.

                    Respond with ONLY valid JSON (no explanations, no extra text), exactly in this format:
                    {"sentence": "transformed sentence", "actor": "NGO|ministry|lobby|media|government|industry"}
                    `.trim()
                }
            ],
            temperature: 0.3,
            top_p: 0.85,
            max_tokens: 180
        });

        const content = completion.choices[0]?.message?.content;
        if(!content) {
            throw new Error('No response from GPT');
        }

        let result
        try {
            result = JSON.parse(content);
        } catch(e) {
            throw new Error('Invalid GPT response format');
        }

        return res.status(200).json({
            success:true,
            sentence: result.sentence,
            actor: result.actor
        });


    } catch (error) {
        console.log('API error:', error.message);
        return res.status(500).json({
            success:false,
            message: error.message || 'Transformation failed'
        });
    }
}