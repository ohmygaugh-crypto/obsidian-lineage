import { DocumentState, NodeId } from '../document-state-type';

export type AIAction =
    | {
          type: 'ai/context-preview/enable';
          payload: {
              nodeId: NodeId;
              highlightedNodes: NodeId[];
              tokenEstimate: number;
          };
      }
    | {
          type: 'ai/context-preview/disable';
      }
    | {
          type: 'ai/toggle-enabled';
          payload: {
              enabled: boolean;
          };
      }
    | {
          type: 'ai/session/set-active';
          payload: {
              sessionId: string;
          };
      };

export const aiReducer = (state: DocumentState, action: AIAction): void => {
    switch (action.type) {
        case 'ai/context-preview/enable':
            state.ai.contextPreviewMode = true;
            state.ai.previewedNodeId = action.payload.nodeId;
            state.ai.highlightedContextNodes = action.payload.highlightedNodes;
            // Store token estimate in node metadata
            const node = state.document.content[action.payload.nodeId];
            if (node) {
                if (!node.aiMetadata) {
                    node.aiMetadata = { type: 'prompt' };
                }
                node.aiMetadata.tokenEstimate = action.payload.tokenEstimate;
            }
            break;

        case 'ai/context-preview/disable':
            state.ai.contextPreviewMode = false;
            state.ai.previewedNodeId = null;
            state.ai.highlightedContextNodes = [];
            break;

        case 'ai/toggle-enabled':
            state.ai.enabled = action.payload.enabled;
            break;

        case 'ai/session/set-active':
            state.ai.activeAgentSession = action.payload.sessionId;
            break;
    }
};

