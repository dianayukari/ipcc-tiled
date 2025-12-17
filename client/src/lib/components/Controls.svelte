<script>
    import {
        originalSentence,
        currentSentence,
        transformations,
        patternStatus,
        loading,
        actorGuess,
        visualParams,

		motionTrigger

    } from '$lib/stores'
    import { transformSentence } from '$lib/api';

    async function handleTransform(feature) {

        loading.set(true);

        try { 
            const result = await transformSentence(
                $currentSentence || $originalSentence,
                feature,
                $patternStatus
            );

            currentSentence.set(result.text);
            actorGuess.set(result.actorGuess) || '';

            visualParams.set({
                segments: result.segments,
                hue: result.hue,
                speed: result.speed,
                noiseScale: result.noiseScale
                }
            )

            transformations.update( t => [
                ...t,
                {
                    feature,
                    patternStatus: $patternStatus,
                    index: t.length + 1,
                    text: result.text,
                    actorGuess: result.actorGuess,
                    segments: result.segments,
                    hue: result.hue,
                    speed: result.speed,
                    noiseScale: result.noiseScale
                }
            ]);

            motionTrigger.update(n => n+1)
            
        } catch (e) {
            console.log(e)
        } finally {
            loading.set(false)
        }
    }


</script>

<div class="controls">
    <div class="sentences">
        <p>Original:{$originalSentence}</p>
        {console.log($currentSentence)}
        {#if $currentSentence}
        <p>Current: {$currentSentence}</p>
        {/if}
    </div>

    <div class="transform-controls">
        <button on:click={()=>handleTransform('vocab')} disabled={$loading}>vocab</button>
        <button on:click={()=>handleTransform('modality') } disabled={$loading}>modality</button>
        <button on:click={()=>handleTransform('transitivity')} disabled={$loading}>transitivity</button>

        <select bind:value={$patternStatus}>
            <option value="maintained">maintain</option>
            <option value="changed">changed</option>
            <option value="omitted">omitted</option>
        </select>
    </div>
</div>