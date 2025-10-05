import { App, TFile, TFolder } from 'obsidian';
import Fuse from 'fuse.js';

export type AutocompleteItem = {
    path: string;
    type: 'file' | 'folder';
    displayName: string;
};

/**
 * Get autocomplete suggestions for @ mentions
 */
export class MentionAutocomplete {
    private fuse: Fuse<AutocompleteItem> | null = null;
    private items: AutocompleteItem[] = [];

    constructor(private app: App) {
        this.buildIndex();
    }

    /**
     * Build search index from vault files
     */
    private buildIndex(): void {
        this.items = [];

        const files = this.app.vault.getAllLoadedFiles();
        
        for (const file of files) {
            if (file instanceof TFile) {
                this.items.push({
                    path: file.path,
                    type: 'file',
                    displayName: file.basename,
                });
            } else if (file instanceof TFolder) {
                this.items.push({
                    path: file.path + '/',
                    type: 'folder',
                    displayName: file.name + '/',
                });
            }
        }

        // Create fuzzy search index
        this.fuse = new Fuse(this.items, {
            keys: ['path', 'displayName'],
            threshold: 0.3,
            distance: 100,
        });
    }

    /**
     * Get autocomplete suggestions
     */
    getSuggestions(query: string, limit = 10): AutocompleteItem[] {
        if (!this.fuse || !query) return [];

        const results = this.fuse.search(query, { limit });
        return results.map((result) => result.item);
    }

    /**
     * Refresh index (call when vault changes)
     */
    refresh(): void {
        this.buildIndex();
    }
}

/**
 * Insert mention at cursor position
 */
export const insertMentionAtCursor = (
    editor: CodeMirror.Editor,
    mention: string,
    startPos: CodeMirror.Position,
    endPos: CodeMirror.Position,
): void => {
    // Remove the @ trigger and partial query
    editor.replaceRange('', startPos, endPos);
    
    // Insert the mention
    const needsQuotes = mention.includes(' ');
    const formattedMention = needsQuotes ? `@"${mention}"` : `@${mention}`;
    
    editor.replaceRange(formattedMention + ' ', startPos);
    
    // Move cursor to end
    const newPos = {
        line: startPos.line,
        ch: startPos.ch + formattedMention.length + 1,
    };
    editor.setCursor(newPos);
};

/**
 * Detect @ mention trigger and get query
 */
export const detectMentionTrigger = (
    editor: CodeMirror.Editor,
): { query: string; startPos: CodeMirror.Position; endPos: CodeMirror.Position } | null => {
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    const textBeforeCursor = line.substring(0, cursor.ch);
    
    // Find last @ symbol
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex === -1) return null;
    
    // Check if @ is at start or preceded by whitespace
    if (atIndex > 0 && !/\s/.test(textBeforeCursor[atIndex - 1])) {
        return null;
    }
    
    // Extract query after @
    const query = textBeforeCursor.substring(atIndex + 1);
    
    // Check if query contains spaces or special chars (ignore if so)
    if (/[^a-zA-Z0-9-_./]/.test(query)) {
        return null;
    }
    
    return {
        query,
        startPos: { line: cursor.line, ch: atIndex },
        endPos: cursor,
    };
};

