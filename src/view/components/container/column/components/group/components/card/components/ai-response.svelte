<script lang="ts">
    import { NodeId } from 'src/stores/document/document-state-type';
    import { getView } from '../../../../../../../container/context';
    import { contentStore } from 'src/stores/document/derived/content-store';

    export let nodeId: NodeId;
    const view = getView();
    const content = contentStore(view, nodeId);

    $: aiMetadata = $content?.aiMetadata;
    $: isStreaming = aiMetadata?.isStreaming || false;
    $: hasError = !!aiMetadata?.error;
</script>

{#if isStreaming}
    <div class="ai-streaming-indicator">
        <span class="ai-spinner"></span>
        <span>AI is responding...</span>
    </div>
{/if}

{#if hasError}
    <div class="ai-error">
        <span class="ai-error-icon">⚠️</span>
        <span>Error: {aiMetadata?.error}</span>
    </div>
{/if}

<style>
    .ai-streaming-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        background-color: var(--background-modifier-border);
        border-radius: 4px;
        margin-bottom: 8px;
        font-size: 0.9em;
        color: var(--text-muted);
    }

    .ai-spinner {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 2px solid var(--text-muted);
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .ai-error {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        background-color: var(--background-modifier-error);
        border-radius: 4px;
        margin-bottom: 8px;
        font-size: 0.9em;
        color: var(--text-error);
    }

    .ai-error-icon {
        font-size: 1.2em;
    }
</style>

