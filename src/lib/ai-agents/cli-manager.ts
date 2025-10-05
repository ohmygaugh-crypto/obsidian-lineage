import { spawn, ChildProcess } from 'child_process';
import { AIAgentType } from 'src/stores/settings/settings-type';

export type AgentConfig = {
    agentType: AIAgentType;
    customPath?: string;
    model?: string;
    workingDirectory?: string;
};

export type AgentResponse = {
    type: 'chunk' | 'complete' | 'error';
    content: string;
    error?: string;
};

/**
 * Manages CLI agent processes for LLM interactions
 */
export class CLIAgentManager {
    private process: ChildProcess | null = null;
    private responseBuffer: string = '';
    private onResponseCallback: ((response: AgentResponse) => void) | null =
        null;

    constructor(private config: AgentConfig) {}

    /**
     * Get command and args based on agent type
     */
    private getAgentCommand(): { command: string; args: string[] } {
        switch (this.config.agentType) {
            case 'cursor-cli':
                return {
                    command: 'cursor',
                    args: ['chat', '--stdin'],
                };
            case 'droid':
                return {
                    command: 'droid',
                    args: ['--stdin'],
                };
            case 'claude-code':
                return {
                    command: 'claude-code',
                    args: ['--stdin'],
                };
            case 'custom':
                if (!this.config.customPath) {
                    throw new Error('Custom agent path not configured');
                }
                return {
                    command: this.config.customPath,
                    args: [],
                };
            default:
                throw new Error(
                    `Unknown agent type: ${this.config.agentType}`,
                );
        }
    }

    /**
     * Start the agent process
     */
    async start(): Promise<void> {
        if (this.process) {
            throw new Error('Agent process already running');
        }

        const { command, args } = this.getAgentCommand();

        this.process = spawn(command, args, {
            cwd: this.config.workingDirectory,
            stdio: ['pipe', 'pipe', 'pipe'],
        });

        // Handle stdout (response)
        this.process.stdout?.on('data', (data: Buffer) => {
            const chunk = data.toString();
            this.responseBuffer += chunk;

            if (this.onResponseCallback) {
                this.onResponseCallback({
                    type: 'chunk',
                    content: chunk,
                });
            }
        });

        // Handle stderr (errors)
        this.process.stderr?.on('data', (data: Buffer) => {
            const error = data.toString();
            console.error('Agent error:', error);

            if (this.onResponseCallback) {
                this.onResponseCallback({
                    type: 'error',
                    content: '',
                    error,
                });
            }
        });

        // Handle process exit
        this.process.on('close', (code: number | null) => {
            console.log('Agent process exited with code:', code);

            if (this.onResponseCallback) {
                this.onResponseCallback({
                    type: 'complete',
                    content: this.responseBuffer,
                });
            }

            this.process = null;
            this.responseBuffer = '';
        });

        // Handle errors
        this.process.on('error', (error: Error) => {
            console.error('Failed to start agent process:', error);

            if (this.onResponseCallback) {
                this.onResponseCallback({
                    type: 'error',
                    content: '',
                    error: error.message,
                });
            }
        });
    }

    /**
     * Send prompt to agent
     */
    async sendPrompt(prompt: string, context?: string): Promise<void> {
        if (!this.process || !this.process.stdin) {
            throw new Error('Agent process not running');
        }

        this.responseBuffer = '';

        // Format prompt with context
        let fullPrompt = prompt;
        if (context) {
            fullPrompt = `Context:\n${context}\n\nPrompt:\n${prompt}`;
        }

        // Write to stdin
        this.process.stdin.write(fullPrompt + '\n');
    }

    /**
     * Register callback for responses
     */
    onResponse(callback: (response: AgentResponse) => void): void {
        this.onResponseCallback = callback;
    }

    /**
     * Stop the agent process
     */
    async stop(): Promise<void> {
        if (!this.process) {
            return;
        }

        return new Promise((resolve) => {
            if (!this.process) {
                resolve();
                return;
            }

            this.process.on('close', () => {
                this.process = null;
                resolve();
            });

            // Try graceful shutdown first
            this.process.stdin?.end();

            // Force kill after timeout
            setTimeout(() => {
                if (this.process) {
                    this.process.kill('SIGKILL');
                }
            }, 5000);
        });
    }

    /**
     * Check if agent is running
     */
    isRunning(): boolean {
        return this.process !== null;
    }

    /**
     * Get current response buffer
     */
    getResponseBuffer(): string {
        return this.responseBuffer;
    }
}

/**
 * Session manager for multiple agent instances (one per file)
 */
export class AgentSessionManager {
    private sessions: Map<string, CLIAgentManager> = new Map();

    /**
     * Get or create agent for file
     */
    getOrCreateAgent(filePath: string, config: AgentConfig): CLIAgentManager {
        let agent = this.sessions.get(filePath);

        if (!agent) {
            agent = new CLIAgentManager(config);
            this.sessions.set(filePath, agent);
        }

        return agent;
    }

    /**
     * Stop agent for file
     */
    async stopAgent(filePath: string): Promise<void> {
        const agent = this.sessions.get(filePath);
        if (agent) {
            await agent.stop();
            this.sessions.delete(filePath);
        }
    }

    /**
     * Stop all agents
     */
    async stopAll(): Promise<void> {
        const stopPromises = Array.from(this.sessions.values()).map((agent) =>
            agent.stop(),
        );
        await Promise.all(stopPromises);
        this.sessions.clear();
    }

    /**
     * Get active sessions count
     */
    getActiveSessionCount(): number {
        return this.sessions.size;
    }
}

