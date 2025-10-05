import { LineageView } from 'src/view/view';
import { NodeId } from 'src/stores/document/document-state-type';
import { id } from 'src/helpers/id';

/**
 * Create a child card for AI response
 */
export const createResponseCard = (
    view: LineageView,
    parentNodeId: NodeId,
): NodeId => {
    const responseNodeId = id.node();

    // Create response node as child of prompt
    view.documentStore.dispatch({
        type: 'document/add-node',
        payload: {
            position: 'right',
            activeNodeId: parentNodeId,
            content: '',
        },
    });

    // Mark as AI response
    const content = view.documentStore.getValue().document.content;
    if (content[responseNodeId]) {
        content[responseNodeId].aiMetadata = {
            type: 'response',
            isStreaming: true,
        };
    }

    return responseNodeId;
};

/**
 * Update streaming content in response card
 */
export const updateStreamingContent = (
    view: LineageView,
    nodeId: NodeId,
    content: string,
): void => {
    view.documentStore.dispatch({
        type: 'document/update-node-content',
        payload: {
            nodeId,
            content,
        },
        context: {
            isInSidebar: false,
        },
    });
};

/**
 * Mark streaming as complete
 */
export const finalizeResponseCard = (
    view: LineageView,
    nodeId: NodeId,
): void => {
    const content = view.documentStore.getValue().document.content;
    if (content[nodeId]?.aiMetadata) {
        content[nodeId].aiMetadata!.isStreaming = false;
    }
};

/**
 * Mark response with error
 */
export const setResponseError = (
    view: LineageView,
    nodeId: NodeId,
    error: string,
): void => {
    const content = view.documentStore.getValue().document.content;
    if (content[nodeId]?.aiMetadata) {
        content[nodeId].aiMetadata!.error = error;
        content[nodeId].aiMetadata!.isStreaming = false;
    }
};

