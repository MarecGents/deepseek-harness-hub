export declare function subscribeTabs(cb: () => void): () => void;
export declare function getTabs(): string[];
export declare function useTabs(): string[];
export declare function tabAdd(id: string): void;
export declare function tabRemove(id: string): void;
export declare function tabReplaceOrder(ids: string[]): void;
