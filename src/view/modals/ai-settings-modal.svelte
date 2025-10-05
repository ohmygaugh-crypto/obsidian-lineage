<script lang="ts">
    import { getContext } from 'svelte';
    import Lineage from 'src/main';
    import type { AIAgentType, AIContextMode } from 'src/stores/settings/settings-type';

    const plugin: Lineage = getContext('plugin');
    const settings = plugin.settings;

    $: aiSettings = $settings.ai;

    function updateSetting<K extends keyof typeof aiSettings>(
        key: K,
        value: (typeof aiSettings)[K],
    ) {
        settings.dispatch({
            type: 'settings/ai/update',
            payload: { [key]: value },
        });
    }
</script>

<div class="ai-settings-modal">
    <h2>AI Agent Settings</h2>
    
    <div class="setting-item">
        <div class="setting-item-info">
            <div class="setting-item-name">Enable AI Features</div>
            <div class="setting-item-description">
                Enable LLM chat integration in Gingko view
            </div>
        </div>
        <div class="setting-item-control">
            <input
                type="checkbox"
                checked={aiSettings.enabled}
                on:change={(e) => updateSetting('enabled', e.currentTarget.checked)}
            />
        </div>
    </div>

    {#if aiSettings.enabled}
        <div class="setting-item">
            <div class="setting-item-info">
                <div class="setting-item-name">Agent Type</div>
                <div class="setting-item-description">
                    Choose which CLI agent to use
                </div>
            </div>
            <div class="setting-item-control">
                <select
                    value={aiSettings.agentType}
                    on:change={(e) => updateSetting('agentType', e.currentTarget.value as AIAgentType)}
                >
                    <option value="cursor-cli">Cursor CLI</option>
                    <option value="droid">Droid</option>
                    <option value="claude-code">Claude Code</option>
                    <option value="custom">Custom</option>
                </select>
            </div>
        </div>

        {#if aiSettings.agentType === 'custom'}
            <div class="setting-item">
                <div class="setting-item-info">
                    <div class="setting-item-name">Custom Agent Path</div>
                    <div class="setting-item-description">
                        Path to your custom CLI agent executable
                    </div>
                </div>
                <div class="setting-item-control">
                    <input
                        type="text"
                        value={aiSettings.customAgentPath}
                        on:input={(e) => updateSetting('customAgentPath', e.currentTarget.value)}
                        placeholder="/path/to/agent"
                    />
                </div>
            </div>
        {/if}

        <div class="setting-item">
            <div class="setting-item-info">
                <div class="setting-item-name">Default Model</div>
                <div class="setting-item-description">
                    Model to use (e.g., claude-4.5-sonnet)
                </div>
            </div>
            <div class="setting-item-control">
                <input
                    type="text"
                    value={aiSettings.defaultModel}
                    on:input={(e) => updateSetting('defaultModel', e.currentTarget.value)}
                    placeholder="claude-4.5-sonnet"
                />
            </div>
        </div>

        <div class="setting-item">
            <div class="setting-item-info">
                <div class="setting-item-name">Context Mode</div>
                <div class="setting-item-description">
                    How context is inherited in tree branches
                </div>
            </div>
            <div class="setting-item-control">
                <select
                    value={aiSettings.contextMode}
                    on:change={(e) => updateSetting('contextMode', e.currentTarget.value as AIContextMode)}
                >
                    <option value="cumulative">Cumulative (parent chain)</option>
                    <option value="isolated">Isolated (no inheritance)</option>
                    <option value="manual">Manual (user controlled)</option>
                </select>
            </div>
        </div>

        <div class="setting-item">
            <div class="setting-item-info">
                <div class="setting-item-name">Two-Stage Submission</div>
                <div class="setting-item-description">
                    Show context preview before submitting
                </div>
            </div>
            <div class="setting-item-control">
                <input
                    type="checkbox"
                    checked={aiSettings.twoStageSubmission}
                    on:change={(e) => updateSetting('twoStageSubmission', e.currentTarget.checked)}
                />
            </div>
        </div>

        <div class="setting-item">
            <div class="setting-item-info">
                <div class="setting-item-name">Show Token Estimates</div>
                <div class="setting-item-description">
                    Display token count estimates in preview
                </div>
            </div>
            <div class="setting-item-control">
                <input
                    type="checkbox"
                    checked={aiSettings.showTokenEstimates}
                    on:change={(e) => updateSetting('showTokenEstimates', e.currentTarget.checked)}
                />
            </div>
        </div>

        <div class="setting-item">
            <div class="setting-item-info">
                <div class="setting-item-name">Usage Instructions</div>
                <div class="setting-item-description">
                    <strong>Workflow:</strong><br>
                    1. Type prompt in card<br>
                    2. Press <kbd>Cmd+Enter</kbd> to preview context<br>
                    3. Press <kbd>Cmd+Enter</kbd> again to submit<br>
                    <br>
                    <strong>@ Mentions:</strong><br>
                    • <code>@file.md</code> - Include file<br>
                    • <code>@folder/</code> - List folder<br>
                    • <code>@file.md#symbol</code> - Include symbol<br>
                    <br>
                    <strong>Forking Context:</strong><br>
                    Each branch inherits only its parent chain!
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .ai-settings-modal {
        padding: 20px;
        max-width: 800px;
    }

    h2 {
        margin-bottom: 20px;
    }

    .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 12px 0;
        border-bottom: 1px solid var(--background-modifier-border);
    }

    .setting-item-info {
        flex: 1;
        padding-right: 20px;
    }

    .setting-item-name {
        font-weight: 600;
        margin-bottom: 4px;
    }

    .setting-item-description {
        font-size: 0.9em;
        color: var(--text-muted);
        line-height: 1.4;
    }

    .setting-item-control {
        flex-shrink: 0;
    }

    input[type='text'] {
        width: 250px;
        padding: 6px;
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        background: var(--background-primary);
        color: var(--text-normal);
    }

    select {
        padding: 6px;
        border: 1px solid var(--background-modifier-border);
        border-radius: 4px;
        background: var(--background-primary);
        color: var(--text-normal);
        min-width: 200px;
    }

    kbd {
        padding: 2px 6px;
        background: var(--background-modifier-border);
        border-radius: 3px;
        font-family: monospace;
        font-size: 0.9em;
    }

    code {
        background: var(--background-modifier-border);
        padding: 2px 6px;
        border-radius: 3px;
        font-family: monospace;
        font-size: 0.9em;
    }
</style>
