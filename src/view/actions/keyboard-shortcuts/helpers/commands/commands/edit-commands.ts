import { saveNodeContent } from 'src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/save-node-content';
import { cancelChanges } from 'src/view/actions/keyboard-shortcuts/helpers/commands/commands/helpers/cancel-changes';
import { DefaultViewCommand } from 'src/view/actions/keyboard-shortcuts/helpers/commands/default-view-hotkeys';
import { showContextPreview, submitPromptToAgent } from 'src/view/actions/ai/submit-prompt';

export const editCommands = () => {
    return [
        {
            name: 'enable_edit_mode',
            callback: (view, event) => {
                event.preventDefault();
                view.viewStore.dispatch({
                    type: 'view/editor/enable-main-editor',
                    payload: {
                        nodeId: view.viewStore.getValue().document.activeNode,
                    },
                });
            },
            hotkeys: [
                { key: 'Enter', modifiers: [], editorState: 'editor-off' },
            ],
        },
        {
            name: 'enable_edit_mode_and_place_cursor_at_start',
            callback: (view, event) => {
                event.preventDefault();
                const nodeId = view.viewStore.getValue().document.activeNode;
                view.inlineEditor.setNodeCursor(nodeId, { line: 0, ch: 0 });
                view.viewStore.dispatch({
                    type: 'view/editor/enable-main-editor',
                    payload: {
                        nodeId: nodeId,
                    },
                });
            },
            hotkeys: [
                {
                    key: 'Enter',
                    modifiers: ['Shift'],
                    editorState: 'editor-off',
                },
            ],
        },
        {
            name: 'enable_edit_mode_and_place_cursor_at_end',
            callback: (view, event) => {
                event.preventDefault();
                const nodeId = view.viewStore.getValue().document.activeNode;
                view.inlineEditor.deleteNodeCursor(nodeId);
                view.viewStore.dispatch({
                    type: 'view/editor/enable-main-editor',
                    payload: {
                        nodeId: nodeId,
                    },
                });
            },
            hotkeys: [
                { key: 'Enter', modifiers: ['Alt'], editorState: 'editor-off' },
            ],
        },
        {
            name: 'save_changes_and_exit_card',
            callback: (view) => {
                saveNodeContent(view);
            },
            hotkeys: [
                {
                    key: 'Enter',
                    modifiers: ['Shift', 'Mod'],
                    editorState: 'editor-on',
                },
            ],
        },
        {
            name: 'ai_context_preview_or_submit',
            callback: async (view, event) => {
                event.preventDefault();
                
                console.log('[Origami AI] Cmd+Enter detected');
                
                const aiSettings = view.plugin.settings.getValue().ai;
                const docState = view.documentStore.getValue();
                
                console.log('[Origami AI] Settings:', { 
                    enabled: aiSettings.enabled, 
                    twoStage: aiSettings.twoStageSubmission 
                });
                
                // Only handle if AI is enabled and two-stage is on
                if (!aiSettings.enabled || !aiSettings.twoStageSubmission) {
                    // Fall back to regular save
                    console.log('[Origami AI] Not enabled or two-stage off, saving normally');
                    saveNodeContent(view);
                    return;
                }
                
                const nodeId = docState.sections.section_id[docState.sections.id_section[
                    view.viewStore.getValue().document.activeNode
                ]] || view.viewStore.getValue().document.activeNode;
                
                console.log('[Origami AI] Active node:', nodeId);
                console.log('[Origami AI] Preview mode:', docState.ai.contextPreviewMode);
                
                // Check if already in preview mode
                if (docState.ai.contextPreviewMode && docState.ai.previewedNodeId === nodeId) {
                    // Second Enter - submit
                    console.log('[Origami AI] Stage 2: Submitting to agent...');
                    await submitPromptToAgent(view, nodeId);
                    saveNodeContent(view);
                } else {
                    // First Enter - show preview
                    console.log('[Origami AI] Stage 1: Showing context preview...');
                    await showContextPreview(view, nodeId);
                }
            },
            hotkeys: [
                {
                    key: 'Enter',
                    modifiers: ['Mod'],
                    editorState: 'editor-on',
                },
            ],
        },
        {
            name: 'disable_edit_mode',
            callback: (view) => {
                cancelChanges(view);
                // Also cancel AI preview if active
                const docState = view.documentStore.getValue();
                if (docState.ai.contextPreviewMode) {
                    view.documentStore.dispatch({
                        type: 'ai/context-preview/disable',
                    });
                }
            },
            hotkeys: [
                { key: 'Escape', modifiers: [], editorState: 'editor-on' },
            ],
        },
    ] satisfies DefaultViewCommand[];
};
