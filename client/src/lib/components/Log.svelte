<script>
    import { visualLog } from '$lib/stores';
</script>

<div class="log">
    <p>Transformations</p>
    {#if $visualLog.length === 0}
        <p class="list">No transformations yet</p>
    {:else}
        <ul>
            {#each $visualLog as entry}
                <li class="list">
                    <span class="summary">{entry.summary}</span>
                </li>
            {/each}
        </ul>
    {/if}
</div>

<style>

    .list {
        list-style-type: none;
        margin: 0;
        padding: 0;
        color: #A9A9A9;
    }


</style>