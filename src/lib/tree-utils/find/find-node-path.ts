import { Column } from 'src/stores/document/document-state-type';
import { NodeId } from 'src/stores/document/document-state-type';

/**
 * Find the path from root to a specific node
 * Returns an array of node IDs representing the path, or null if not found
 */
export function findNodePath(columns: Column[], targetNodeId: NodeId): NodeId[] | null {
    const path: NodeId[] = [];
    
    function searchInColumn(column: Column, currentPath: NodeId[]): boolean {
        for (const group of column.groups) {
            for (const nodeId of group.nodes) {
                const newPath = [...currentPath, nodeId];
                
                if (nodeId === targetNodeId) {
                    path.push(...newPath);
                    return true;
                }
                
                // Check if this node has children in next column
                const nextColumnIndex = columns.indexOf(column) + 1;
                if (nextColumnIndex < columns.length) {
                    if (searchInColumn(columns[nextColumnIndex], newPath)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    // Start search from first column
    if (columns.length > 0) {
        searchInColumn(columns[0], []);
    }
    
    return path.length > 0 ? path : null;
}
