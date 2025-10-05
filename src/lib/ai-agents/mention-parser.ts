import { TFile, TFolder, Vault } from 'obsidian';

export type MentionType = 'file' | 'folder' | 'symbol';

export type ParsedMention = {
    type: MentionType;
    path: string;
    symbol?: string;
    raw: string;
    startIndex: number;
    endIndex: number;
};

/**
 * Parse @ mentions from text
 * Supports: @file.md, @folder/, @file.md#symbol
 */
export class MentionParser {
    // Match @path or @path#symbol, allowing spaces in paths when quoted
    private static MENTION_REGEX = /@(?:"([^"]+)"|([^\s#]+))(?:#(\w+))?/g;

    static parse(text: string): ParsedMention[] {
        const mentions: ParsedMention[] = [];
        let match: RegExpExecArray | null;

        while ((match = this.MENTION_REGEX.exec(text)) !== null) {
            const quotedPath = match[1];
            const unquotedPath = match[2];
            const path = quotedPath || unquotedPath;
            const symbol = match[3];

            const type = this.determineMentionType(path, symbol);

            mentions.push({
                type,
                path: path.trim(),
                symbol,
                raw: match[0],
                startIndex: match.index,
                endIndex: match.index + match[0].length,
            });
        }

        return mentions;
    }

    private static determineMentionType(
        path: string,
        symbol?: string,
    ): MentionType {
        if (symbol) return 'symbol';
        if (path.endsWith('/')) return 'folder';
        return 'file';
    }

    /**
     * Validate mentions against vault contents
     */
    static async validateMentions(
        mentions: ParsedMention[],
        vault: Vault,
    ): Promise<Map<ParsedMention, TFile | TFolder | null>> {
        const results = new Map<ParsedMention, TFile | TFolder | null>();

        for (const mention of mentions) {
            const abstractFile = vault.getAbstractFileByPath(mention.path);

            if (!abstractFile) {
                // Try with .md extension if not provided
                const withMd = mention.path.endsWith('.md')
                    ? mention.path
                    : `${mention.path}.md`;
                const file = vault.getAbstractFileByPath(withMd);
                results.set(mention, file as TFile | TFolder | null);
            } else {
                results.set(mention, abstractFile as TFile | TFolder);
            }
        }

        return results;
    }

    /**
     * Extract file paths from mentions
     */
    static extractFilePaths(mentions: ParsedMention[]): string[] {
        return mentions
            .filter((m) => m.type === 'file' || m.type === 'symbol')
            .map((m) => m.path);
    }

    /**
     * Extract folder paths from mentions
     */
    static extractFolderPaths(mentions: ParsedMention[]): string[] {
        return mentions.filter((m) => m.type === 'folder').map((m) => m.path);
    }
}

