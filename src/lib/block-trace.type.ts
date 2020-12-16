export type BalanceChange = {
  readonly sendBbefore: string;
  readonly sendBafter: string;
  readonly recvBbefore: string;
  readonly recvBafter: string;
};

export type TraceItemResult<T extends boolean> = {
  readonly success: T;
  readonly data: string;
};

export type TraceItemLog = {
  readonly data: string;
  readonly topics: string[];
  readonly op: 'LOG0' | 'LOG1' | 'LOG2' | 'LOG3' | 'LOG4';
};

export type TraceItemSelfDestruct = {
  readonly beneficiary: string;
  readonly value: string;
  readonly op: 'SELFDESTRUCT';
  readonly balanceChange: BalanceChange;
};

export type TraceItemCallInfo = {
  readonly op: 'CALL' | 'DELEGATECALL' | 'CREATE' | 'CREATE2';
  readonly address: string;
  readonly data: string;
  readonly value: string;
  readonly gas: string;
  readonly items: readonly TraceItem[] | null;
  readonly result: TraceItemResult<boolean> | null;
  readonly balanceChange: unknown;
};

export type TraceItemSuccessfulCallInfo = TraceItemCallInfo & {
  readonly result: TraceItemResult<true>;
  readonly balanceChange: BalanceChange;
};

export type TraceItemFailedCallInfo = TraceItemCallInfo & {
  readonly result: TraceItemResult<false> | null;
  readonly balanceChange: null;
  readonly items: null;
  readonly exception: string;
};

export type TraceItem = TraceItemSuccessfulCallInfo | TraceItemFailedCallInfo | TraceItemLog | TraceItemSelfDestruct;

export type TransactionBase = {
  readonly gasUsed: string;
  readonly gasLimit: string;
  readonly gasPrice: string;
  readonly fee: string;
  readonly origin: string;
  readonly nonce: number;
  readonly sigS: string;
  readonly sigR: string;
  readonly sigV: string;
};

export type TransactionTrace = TransactionBase & {
  readonly txHash: string;
  readonly item: TraceItemSuccessfulCallInfo | TraceItemFailedCallInfo;
};

export type BlockReward = {
  readonly beneficiary: string;
  readonly reward: string;
};

export type BlockBase = {
  readonly timestamp: number;
  readonly difficulty: number;
};

export type BlockHeader = {
  readonly gasUsed: string;
  readonly sha3Uncles: string;
  readonly extraData: string;
  readonly mixHash: string;
  readonly nonce: number;
  readonly logsBloom: string;
  readonly stateRoot: string;
  readonly transactionsRoot: string;
  readonly receiptsRoot: string;
};

export type BlockTrace = {
  readonly header: BlockBase &
    BlockHeader & {
      readonly blockHash: string;
      readonly parentBlockHash: string;
      readonly blockNumber: number;
      readonly gasLimit: string;
    };
  readonly rewards: readonly BlockReward[];
  readonly txs: readonly TransactionTrace[];
};
