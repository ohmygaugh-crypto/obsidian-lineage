<script lang="ts">
    import { NodeId } from 'src/stores/document/document-state-type';
    import { getView } from '../../../../../../../container/context';

    export let nodeId: NodeId;
    export let tokenEstimate: number;
    export let highlightedNodes: NodeId[];
    export let mentionedFiles: string[];

    const view = getView();
</script>

<div class="context-preview-overlay">
    <div class="context-preview-header">
        <span class="context-preview-title">Context Preview</span>
        <span class="context-preview-close" 
              on:click={() => {
                  view.documentStore.dispatch({
                      type: 'ai/context-preview/disable'
                  });
              }}>✕</span>
    </div>
    
    <div class="context-preview-content">
        <div class="context-stat">
            <span class="context-label">Parent Cards:</span>
            <span class="context-value">{highlightedNodes.length}</span>
        </div>
        
        <div class="context-stat">
            <span class="context-label">Token Estimate:</span>
            <span class="context-value">{tokenEstimate.toLocaleString()}</span>
        </div>
        
        {#if mentionedFiles.length > 0}
            <div class="context-stat">
                <span class="context-label">Mentioned Files:</span>
                <div class="mentioned-files">
                    {#each mentionedFiles as file}
                        <span class="mentioned-file">{file}</span>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
    
    <div class="context-preview-footer">
        <span>Press Enter again to send</span>
    </div>
</div>

<style>
    .context-preview-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 16px;
        border-radius: 4px;
        z-index: 100;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .context-preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .context-preview-title {
        font-weight: 600;
        font-size: 1.1em;
    }

    .context-preview-close {
        cursor: pointer;
        font-size: 1.2em;
        opacity: 0.7;
        transition: opacity 0.2s;
    }

    .context-preview-close:hover {
        opacity: 1;
    }

    .context-preview-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
    }

    .context-stat {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .context-label {
        font-size: 0.85em;
        opacity: 0.8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .context-value {
        font-size: 1.2em;
        font-weight: 600;
    }

    .mentioned-files {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .mentioned-file {
        background-color: rgba(255, 255, 255, 0.1);
        padding: 4px 8px;
        border-radius: 3px;
        font-size: 0.9em;
        font-family: monospace;
    }

    .context-preview-footer {
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        text-align: center;
        font-size: 0.9em;
        opacity: 0.8;
        animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 0.8;
        }
        50% {
            opacity: 0.4;
        }
    }
</style>

