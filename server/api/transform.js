import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY })

export default async function handler(req,res) {

    if (req.method != 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed. Use POST.'
        });
    }

    try {
        const { text, feature, patternStatus, abc_original } = req.body;

        if (!text || !feature) {
            return res.status(400).json({
                error: "Missing text or feature"
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
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `
                    You are performing a controlled intralingual translation of an IPCC statement and generating a short melody that reflects the linguistic transformation.
                    
                    Core constraints:
                    Preserve meaning, scope, referents, and factual content of the original statement.
                    Change only the specified linguistic feature.
                    Do not introduce new claims, actors, or evaluative framing beyond what the feature requires.
                    The output sentence must plausibly be uttered by a single, identifiable actor type (e.g. NGO, ministry, lobby).

                    Original statement: 
                    "${text}"

                    Original melody (ABC notation):
                    "${abc_original}"

                    Linguistic feature to transform: ${feature}
                    Feature instruction: ${featureExplanation}

                    Pattern status: ${patternStatus || "maintained"}
                    Pattern instruction: ${patternInstruction}

                    Transformation rules:
                    Apply the feature instruction systematically, not stylistically.
                    If pattern status is "maintained", keep syntactic rhythm and clause structure as close as possible.
                    If pattern status is "changed", modify structure only as required by the feature.

                    Melody transformation rules:
                    Use the original ABC notation as the melodic base.
                    Preserve overall phrase length and bar structure unless the feature requires change.
                    Modify ONLY the parameters implied by the linguistic feature:
                    - pitch range
                    - harmonic density
                    - key
                    - tempo
                    Do not introduce new motifs unrelated to the original melody.
                    Apply musical changes ONLY for the specified linguistic feature (${feature}); all other parameters should remain as close as possible to the original.
                    The generated ABC notation must be syntactically valid and playable.
                    Do not change meter or time signature unless strictly required by the feature.
                    The values for key, tempo, and range must correspond to the generated ABC notation.

                    Musical parameters (relative to the original melody):

                    Vocabulary: 
                    Decreased nominalization / more concrete nouns → expand pitch range
                    Increased nominalization / more abstract nouns → reduce pitch range

                    Transitivity:
                    More active voice / clearer agency → increase harmonic density
                    More passive voice / obscured agency → reduce harmonic density

                    Modality:
                    Increased certainty or obligation → shift toward major key and faster tempo
                    Increased uncertainty or hedging → shift toward minor key and slower tempo

                    The melody must be internally consistent with the linguistic change.

                    Output format (STRICT)
                    Respond with ONLY valid JSON.
                    No explanations, no markdown, no extra text.                    
                    {
                        "sentence": "transformed sentence",
                        "actor": "NGO | ministry | lobby | media | government | industry",
                        "abc": "ABC notation string",
                        "key": "D | Dm | F",
                        "tempo": "60–120",
                        "range": "DA | CD | AA"
                    }

                    Final instruction:
                    Produce one transformed sentence and one melody that together reflect the specified linguistic feature.

                    `.trim(),
            },
          ],
          temperature: 0.3,
          top_p: 0.85,
          max_completion_tokens: 180,
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
            success: true,
            sentence: result.sentence,
            abc: result.abc,
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