import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPEN_API_KEY })

export default async function handler(req,res) {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }


    if (req.method != 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed. Use POST.'
        });
    }

    try {
        const { text, feature, patternStatus } = req.body;

        const VERSION = 2.7

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
            Avoid repeating the same key words and phrasing from the original sentence.`,
            modality: `Apply a modality transformation.
            Rephrase the sentence by changing how certainty, probability, or expectation is expressed linguistically.
            Use different modal verbs, adverbs, or constructions (e.g. implicit vs explicit modality).`,
            transitivity: `Apply a transitivity transformation.
            Rephrase the sentence by changing grammatical agency, voice, or process structure.
            You may shift between active and passive voice, foreground or background agents, or replace actions with nominalized processes.`
        }[feature];

        const patternInstruction = {
          maintained: `Maintain IPCC calibrated language  (e.g. "likely", "very likely", "high confidence").
            Preserve all IPCC likelihood and confidence expressions exactly as written (e.g. "likely", "very likely", "high confidence").
            Do not paraphrase, reinterpret, weaken, or strengthen these expressions.
            Ensure they appear in the transformed sentence in the same semantic role.`,
          omitted: `Omit IPCC calibrated language  (e.g. "likely", "very likely", "high confidence").
            Remove all explicit IPCC likelihood and confidence expressions from the sentence.
            Do not replace them with alternative probability or uncertainty terms.
            Ensure the remaining sentence is grammatically complete and preserves the core claim`,
          changed: `Change IPCC calibrated language  (e.g. "likely", "very likely", "high confidence").
            Replace IPCC likelihood and confidence expressions with non-standard, qualitative uncertainty formulations.
            Preserve the approximate strength of certainty without using IPCC-calibrated terms.
            Do not remove uncertainty entirely and do not intensify or weaken the claim.`,
        }[patternStatus || "maintained"];

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: `
                    You are performing a translation of an IPCC statement to a policy document statement, and deriving visual parameters for a Perlin noise–based generative composition.

                    CORE CONSTRAINTS (MUST ALL BE SATISFIED)
                    - Modify ONLY the specified linguistic feature; all other linguistic dimensions must remain unchanged unless structurally required.
                    - The transformed sentence must plausibly be attributable to a single, identifiable institutional actor type.
                    - The transformation must be from original statement (IPCC report) to policy language, as if it was a document elaborated for politicians to understand and act upon
                    - Imagine a politician from either right wing or left wing government is making this translation and include its bias and self interest.
                    - Each change must be relevant, make BOLD changes in the features to transform.

                    ORIGINAL STATEMENT
                    "${text}"

                    LINGUISTIC TRANSFORMATION
                    - Feature to transform: ${feature}
                    - Feature instruction: ${featureExplanation}

                    PATTERN CONTROL
                    - Pattern status: ${patternStatus || "maintained"}
                    - Pattern instruction: ${patternInstruction}

                    TRANSFORMATION RULES
                    - Apply the feature instruction systematically and consistently across the sentence.
                    - If pattern status is "maintained":
                        Preserve the specific calibrated expressions (e.g. 'likely')
                    - Feel free to add new actors, contexts, transformations as you feel like needed to convey meaning the politician is interested in

                    VISUAL PARAMETER MAPPING (Perlin Noise Composition)

                    VOCABULARY → segments (0.5–4.0)
                    - Simple / concrete vocabulary → 0.5–1.5 (sparse, direct curves)
                    - Complex / abstract vocabulary → 2.0–4.0 (dense, intricate curves)

                    MODALITY → hue (0–360)
                    - High certainty / factual modality → 180–240 (cool blues, stable)
                    - Low certainty / hedging modality → 20–60 (warm oranges, volatile)

                    TRANSITIVITY → speed (0.001–0.02)
                    - Low transitivity / simple processes → 0.001–0.008 (slow, deliberate)
                    - High transitivity / multi-step or agentive processes → 0.010–0.020 (fast, cascading)

                    PATTERN STATUS → noiseScale (0.01–0.10)
                    - maintained → 0.01 (fine detail, controlled variation)
                    - changed → 0.05 (amplified distortion, moderate chaos)
                    - omitted → 0.10 (coarse, near-random fluctuations)


                    OUTPUT FORMAT (STRICT)
                    - Respond with ONLY valid JSON.
                    - this is not markdown, don't add bold, italic or any other formatting.
                    - Do NOT include explanations, comments, or formatting outside JSON.
                    - The JSON object MUST contain exactly the following keys:

                    "text"        : string (single transformed sentence)
                    "actorGuess"  : one of ["NGO", "ministry", "lobby", "media", "government", "industry"]
                    "segments"    : number (0.5–4.0, one decimal place)
                    "hue"         : integer (0–360)
                    "speed"       : number (0.001–0.02, three decimal places)
                    "noiseScale"  : number (0.01–0.10, two decimal places)

                    ACTOR GUESS RULE
                    - Infer the most plausible actor type based solely on linguistic cues (register, modality, agency).

                    EXAMPLE OUTPUT
                    {
                    "text": "transformed sentence here. this is not markdown, don't add formatting",
                    "actorGuess": "NGO",
                    "segments": 2.3,
                    "hue": 220,
                    "speed": 0.012,
                    "noiseScale": 0.05
                    }

                    FINAL INSTRUCTION
                    Produce exactly one transformed sentence and its corresponding visual parameters, ensuring the parameters systematically reflect the linguistic transformation applied.
                    "text" is not markdown, don't add bold, italic or any other formatting.

                    `.trim(),
            },
          ],
          temperature: 0.3,
          top_p: 0.85,
          max_completion_tokens: 1000,
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
            version: VERSION,
            text: result.text,
            actorGuess: result.actorGuess,
            segments: result.segments,
            hue: result.hue,
            speed: result.speed,
            noiseScale: result.noiseScale,
        });


    } catch (error) {
        console.log('API error:', error.message);
        return res.status(500).json({
            success:false,
            message: error.message || 'Transformation failed'
        });
    }
}