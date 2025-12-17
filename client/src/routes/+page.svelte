<script>
	import Controls from "$lib/components/Controls.svelte";
	import Log from "$lib/components/Log.svelte";
    import SketchLine from "$lib/components/SketchLine.svelte";




</script>


<div class="app">
    <div class="col">
        <Controls />
        <SketchLine />
    </div>
    <div class="log">
        <Log />
    </div>
</div>

<style>

    .col {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        padding:0  10px;
    }

    .log {
        display: flex;
        justify-content: right;
        margin-right: 50px;
    }

    @media (max-width: 600px) {
        .log {
            margin-right: 10px;
        }
    }

</style>

