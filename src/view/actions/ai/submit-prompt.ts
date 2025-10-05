import { LineageView } from 'src/view/view';
import { NodeId } from 'src/stores/document/document-state-type';
import { ContextBuilder } from 'src/lib/ai-agents/context-builder';
import { findNodePath } from 'src/lib/tree-utils/find/find-node-path';
import { MentionParser } from 'src/lib/ai-agents/mention-parser';

/**
 * Handle first Enter press - show context preview
 */
export const showContextPreview = async (
    view: LineageView,
    nodeId: NodeId,
): Promise<void> => {
    const state = view.documentStore.getValue();
    
    // Skip if AI not enabled
    if (!view.plugin.settings.getValue().ai.enabled) {
        return;
    }
    
    // Build context builder
    const contextBuilder = new ContextBuilder(
        view.app.vault,
        state.document.content,
    );
    
    // Get parent chain
    const nodePath = findNodePath(state.document.columns, nodeId);
    const parentChain = nodePath ? nodePath.slice(0, -1) : [];
    
    // Gather context
    const context = await contextBuilder.gatherContext(
        nodeId,
        parentChain,
        false, // Don't include current node in context
    );
    
    // Dispatch preview mode
    view.documentStore.dispatch({
        type: 'ai/context-preview/enable',
        payload: {
            nodeId,
            highlightedNodes: context.parentChain,
            tokenEstimate: context.tokenEstimate,
        },
    });
    
    // Store context for submission
    const nodeContent = state.document.content[nodeId];
    if (nodeContent) {
        if (!nodeContent.aiMetadata) {
            nodeContent.aiMetadata = { type: 'prompt' };
        }
        nodeContent.aiMetadata.parentChain = context.parentChain;
        nodeContent.aiMetadata.mentionedFiles = context.mentionedFiles;
        nodeContent.aiMetadata.tokenEstimate = context.tokenEstimate;
    }
};

/**
 * Handle second Enter press - submit to agent
 */
export const submitPromptToAgent = async (
    view: LineageView,
    nodeId: NodeId,
): Promise<void> => {
    const state = view.documentStore.getValue();
    const nodeContent = state.document.content[nodeId];
    
    if (!nodeContent) return;
    
    // Get or create agent session
    const filePath = view.file?.path || 'temp';
    const agentSettings = view.plugin.settings.getValue().ai;
    
    // Import agent manager
    const { AgentSessionManager } = await import(
        'src/lib/ai-agents/cli-manager'
    );
    const sessionManager = new AgentSessionManager();
    
    const agent = sessionManager.getOrCreateAgent(filePath, {
        agentType: agentSettings.agentType,
        customPath: agentSettings.customAgentPath,
        model: agentSettings.defaultModel,
        workingDirectory: (view.app.vault.adapter as any).basePath || process.cwd(),
    });
    
    // Start agent if not running
    if (!agent.isRunning()) {
        await agent.start();
    }
    
    // Build context
    const contextBuilder = new ContextBuilder(
        view.app.vault,
        state.document.content,
    );
    
    const parentChain = nodeContent.aiMetadata?.parentChain || [];
    const context = await contextBuilder.gatherContext(
        nodeId,
        parentChain,
        false,
    );
    
    // Format context and prompt
    const formattedContext = ContextBuilder.formatForAgent(context);
    const prompt = nodeContent.content;
    
    // Create response card
    const { createResponseCard, updateStreamingContent, finalizeResponseCard, setResponseError } = 
        await import('./create-response-card');
    const responseNodeId = createResponseCard(view, nodeId);
    
    let responseBuffer = '';
    
    // Set up response handler
    agent.onResponse((response) => {
        if (response.type === 'chunk') {
            responseBuffer += response.content;
            updateStreamingContent(view, responseNodeId, responseBuffer);
        } else if (response.type === 'complete') {
            finalizeResponseCard(view, responseNodeId);
        } else if (response.type === 'error') {
            setResponseError(view, responseNodeId, response.error || 'Unknown error');
        }
    });
    
    // Send prompt
    await agent.sendPrompt(prompt, formattedContext);
    
    // Disable preview mode
    view.documentStore.dispatch({
        type: 'ai/context-preview/disable',
    });
};

