import { TFile, Vault } from 'obsidian';
import { Content, NodeId } from 'src/stores/document/document-state-type';
import { MentionParser, ParsedMention } from './mention-parser';

export type ContextItem = {
    type: 'node' | 'file' | 'folder';
    nodeId?: NodeId;
    path?: string;
    content: string;
    label: string;
};

export type GatheredContext = {
    items: ContextItem[];
    parentChain: NodeId[];
    mentionedFiles: string[];
    tokenEstimate: number;
};

/**
 * Build context for LLM submissions by gathering parent nodes and @ mentioned files
 */
export class ContextBuilder {
    constructor(
        private vault: Vault,
        private content: Content,
    ) {}

    /**
     * Gather context for a node (parent chain + @ mentions)
     */
    async gatherContext(
        nodeId: NodeId,
        parentChain: NodeId[],
        includeCurrentNode = true,
    ): Promise<GatheredContext> {
        const items: ContextItem[] = [];
        const mentionedFiles: string[] = [];

        // Gather parent context
        for (const ancestorId of parentChain) {
            const nodeContent = this.content[ancestorId]?.content || '';
            items.push({
                type: 'node',
                nodeId: ancestorId,
                content: nodeContent,
                label: `Parent: ${ancestorId.substring(0, 8)}`,
            });
        }

        // Include current node if requested
        if (includeCurrentNode) {
            const currentContent = this.content[nodeId]?.content || '';
            items.push({
                type: 'node',
                nodeId,
                content: currentContent,
                label: `Current: ${nodeId.substring(0, 8)}`,
            });
        }

        // Parse @ mentions from current node
        const currentContent = this.content[nodeId]?.content || '';
        const mentions = MentionParser.parse(currentContent);

        // Gather mentioned files
        const fileItems = await this.gatherMentionedFiles(mentions);
        items.push(...fileItems);
        mentionedFiles.push(
            ...fileItems.map((item) => item.path!).filter(Boolean),
        );

        // Estimate tokens (rough: 1 token ≈ 4 chars)
        const totalChars = items.reduce(
            (sum, item) => sum + item.content.length,
            0,
        );
        const tokenEstimate = Math.ceil(totalChars / 4);

        return {
            items,
            parentChain,
            mentionedFiles,
            tokenEstimate,
        };
    }

    /**
     * Gather content from @ mentioned files
     */
    private async gatherMentionedFiles(
        mentions: ParsedMention[],
    ): Promise<ContextItem[]> {
        const items: ContextItem[] = [];

        for (const mention of mentions) {
            if (mention.type === 'folder') {
                // For folders, list files
                const folderContents = await this.getFolderListing(
                    mention.path,
                );
                items.push({
                    type: 'folder',
                    path: mention.path,
                    content: folderContents,
                    label: `Folder: ${mention.path}`,
                });
            } else {
                // For files and symbols, read file content
                const fileContent = await this.getFileContent(mention.path);
                if (fileContent !== null) {
                    items.push({
                        type: 'file',
                        path: mention.path,
                        content: mention.symbol
                            ? this.extractSymbol(fileContent, mention.symbol)
                            : fileContent,
                        label: mention.symbol
                            ? `${mention.path}#${mention.symbol}`
                            : mention.path,
                    });
                }
            }
        }

        return items;
    }

    /**
     * Read file content from vault
     */
    private async getFileContent(path: string): Promise<string | null> {
        try {
            // Try with exact path
            let file = this.vault.getAbstractFileByPath(path);

            // Try with .md extension
            if (!file && !path.endsWith('.md')) {
                file = this.vault.getAbstractFileByPath(`${path}.md`);
            }

            if (file instanceof TFile) {
                return await this.vault.read(file);
            }

            return null;
        } catch (error) {
            console.error(`Failed to read file: ${path}`, error);
            return null;
        }
    }

    /**
     * Get folder listing
     */
    private async getFolderListing(folderPath: string): Promise<string> {
        const folder = this.vault.getAbstractFileByPath(folderPath);
        if (folder && 'children' in folder) {
            const children = (folder as any).children;
            if (Array.isArray(children)) {
                const files = children
                    .map((child: any) => `- ${child.path}`)
                    .join('\n');
                return `Files in ${folderPath}:\n${files}`;
            }
        }
        return `Folder not found: ${folderPath}`;
    }

    /**
     * Extract symbol from file content (basic implementation)
     * Looks for function/class/const definitions
     */
    private extractSymbol(content: string, symbol: string): string {
        // Simple regex to find symbol definitions
        const patterns = [
            new RegExp(
                `(function\\s+${symbol}\\s*\\([^)]*\\)\\s*{[^}]*})`,
                's',
            ),
            new RegExp(
                `(class\\s+${symbol}\\s*{[\\s\\S]*?^})`,
                'm',
            ),
            new RegExp(
                `(const\\s+${symbol}\\s*=\\s*[^;]+;)`,
                's',
            ),
            new RegExp(
                `(export\\s+(?:const|function|class)\\s+${symbol}[\\s\\S]*?(?=\\nexport|\\n\\n|$))`,
                'm',
            ),
        ];

        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match) {
                return match[1];
            }
        }

        // Fallback: return first 20 lines mentioning the symbol
        const lines = content.split('\n');
        const relevantLines = lines
            .filter((line) => line.includes(symbol))
            .slice(0, 20);

        return relevantLines.length > 0
            ? relevantLines.join('\n')
            : `Symbol ${symbol} not found in detailed search`;
    }

    /**
     * Format context for CLI agent submission
     */
    static formatForAgent(context: GatheredContext): string {
        let formatted = '';

        for (const item of context.items) {
            formatted += `\n---\n`;
            formatted += `[${item.label}]\n\n`;
            formatted += item.content;
            formatted += `\n`;
        }

        return formatted;
    }
}

