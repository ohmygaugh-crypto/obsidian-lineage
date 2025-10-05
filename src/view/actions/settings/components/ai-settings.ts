import { SettingsStore } from 'src/main';
import { AIAgentType, AIContextMode } from 'src/stores/settings/settings-type';

export const AISettings = (container: HTMLElement, store: SettingsStore) => {
    const settings = store.getValue().ai;

    // Enable toggle
    const enableSection = container.createDiv({ cls: 'setting-item' });
    enableSection.createDiv({ cls: 'setting-item-info' }).innerHTML = `
        <div class="setting-item-name">Enable AI Features</div>
        <div class="setting-item-description">Enable LLM chat integration in tree view</div>
    `;
    const enableToggle = enableSection
        .createDiv({ cls: 'setting-item-control' })
        .createEl('input', { type: 'checkbox' });
    enableToggle.checked = settings.enabled;
    enableToggle.addEventListener('change', () => {
        store.dispatch({
            type: 'settings/ai/update',
            payload: { enabled: enableToggle.checked },
        });
    });

    if (!settings.enabled) return;

    // Agent type selector
    const agentSection = container.createDiv({ cls: 'setting-item' });
    agentSection.createDiv({ cls: 'setting-item-info' }).innerHTML = `
        <div class="setting-item-name">Agent Type</div>
        <div class="setting-item-description">Choose which CLI agent to use</div>
    `;
    const agentSelect = agentSection
        .createDiv({ cls: 'setting-item-control' })
        .createEl('select');
    
    ['droid', 'cursor-cli', 'claude-code', 'custom'].forEach((type) => {
        const option = agentSelect.createEl('option', { value: type });
        option.textContent = type;
        option.selected = settings.agentType === type;
    });
    
    agentSelect.addEventListener('change', () => {
        store.dispatch({
            type: 'settings/ai/update',
            payload: { agentType: agentSelect.value as AIAgentType },
        });
    });

    // Custom agent path (if custom selected)
    if (settings.agentType === 'custom') {
        const customPathSection = container.createDiv({ cls: 'setting-item' });
        customPathSection.createDiv({ cls: 'setting-item-info' }).innerHTML = `
            <div class="setting-item-name">Custom Agent Path</div>
            <div class="setting-item-description">Full path to CLI agent executable</div>
        `;
        const customPathInput = customPathSection
            .createDiv({ cls: 'setting-item-control' })
            .createEl('input', { type: 'text', placeholder: '/path/to/agent' });
        customPathInput.value = settings.customAgentPath;
        customPathInput.addEventListener('input', () => {
            store.dispatch({
                type: 'settings/ai/update',
                payload: { customAgentPath: customPathInput.value },
            });
        });
    }

    // Default model
    const modelSection = container.createDiv({ cls: 'setting-item' });
    modelSection.createDiv({ cls: 'setting-item-info' }).innerHTML = `
        <div class="setting-item-name">Default Model</div>
        <div class="setting-item-description">Model name (e.g., claude-4.5-sonnet)</div>
    `;
    const modelInput = modelSection
        .createDiv({ cls: 'setting-item-control' })
        .createEl('input', { type: 'text', placeholder: 'claude-4.5-sonnet' });
    modelInput.value = settings.defaultModel;
    modelInput.addEventListener('input', () => {
        store.dispatch({
            type: 'settings/ai/update',
            payload: { defaultModel: modelInput.value },
        });
    });

    // Context mode
    const contextSection = container.createDiv({ cls: 'setting-item' });
    contextSection.createDiv({ cls: 'setting-item-info' }).innerHTML = `
        <div class="setting-item-name">Context Mode</div>
        <div class="setting-item-description">How context is inherited in tree branches</div>
    `;
    const contextSelect = contextSection
        .createDiv({ cls: 'setting-item-control' })
        .createEl('select');
    
    [
        { value: 'cumulative', label: 'Cumulative (parent chain)' },
        { value: 'isolated', label: 'Isolated (no inheritance)' },
        { value: 'manual', label: 'Manual (user controlled)' },
    ].forEach(({ value, label }) => {
        const option = contextSelect.createEl('option', { value });
        option.textContent = label;
        option.selected = settings.contextMode === value;
    });
    
    contextSelect.addEventListener('change', () => {
        store.dispatch({
            type: 'settings/ai/update',
            payload: { contextMode: contextSelect.value as AIContextMode },
        });
    });

    // Two-stage submission
    const twoStageSection = container.createDiv({ cls: 'setting-item' });
    twoStageSection.createDiv({ cls: 'setting-item-info' }).innerHTML = `
        <div class="setting-item-name">Two-Stage Submission</div>
        <div class="setting-item-description">Show context preview before submitting (Cmd+Enter twice)</div>
    `;
    const twoStageToggle = twoStageSection
        .createDiv({ cls: 'setting-item-control' })
        .createEl('input', { type: 'checkbox' });
    twoStageToggle.checked = settings.twoStageSubmission;
    twoStageToggle.addEventListener('change', () => {
        store.dispatch({
            type: 'settings/ai/update',
            payload: { twoStageSubmission: twoStageToggle.checked },
        });
    });

    // Token estimates
    const tokenSection = container.createDiv({ cls: 'setting-item' });
    tokenSection.createDiv({ cls: 'setting-item-info' }).innerHTML = `
        <div class="setting-item-name">Show Token Estimates</div>
        <div class="setting-item-description">Display token counts in context preview</div>
    `;
    const tokenToggle = tokenSection
        .createDiv({ cls: 'setting-item-control' })
        .createEl('input', { type: 'checkbox' });
    tokenToggle.checked = settings.showTokenEstimates;
    tokenToggle.addEventListener('change', () => {
        store.dispatch({
            type: 'settings/ai/update',
            payload: { showTokenEstimates: tokenToggle.checked },
        });
    });

    // Usage instructions
    const instructionsSection = container.createDiv({ cls: 'setting-item' });
    instructionsSection.createDiv({ cls: 'setting-item-info' }).innerHTML = `
        <div class="setting-item-name">Usage</div>
        <div class="setting-item-description">
            <strong>Workflow:</strong><br>
            1. Type prompt in card<br>
            2. Press <kbd>Cmd+Enter</kbd> to preview context<br>
            3. Press <kbd>Cmd+Enter</kbd> again to submit<br>
            <br>
            <strong>@ Mentions:</strong> <code>@file.md</code>, <code>@folder/</code>, <code>@file#symbol</code><br>
            <br>
            <strong>Fork Behavior:</strong> Each branch sees only its parent chain, not siblings!
        </div>
    `;
};
