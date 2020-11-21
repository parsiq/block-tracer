export type BalanceChange = {
  readonly sendBbefore: string;
  readonly sendBafter: string;
  readonly recvBbefore: string;
  readonly recvBafter: string;
};

export type TraceItemLog = {
  readonly tag: 'NATIVE';
  readonly data: string;
  readonly topics: string[];
  readonly op: 'LOG0' | 'LOG1' | 'LOG2' | 'LOG3' | 'LOG4';
};

export type TraceItemErc20Transfer = {
  readonly tag: 'ERC_20_TRANSFER';
  readonly from: string;
  readonly to: string;
  readonly value: string;
  readonly op: 'LOG3';
};

export type TraceItemErc721Transfer = {
  readonly tag: 'ERC_721_TRANSFER';
  readonly from: string;
  readonly to: string;
  readonly tokenId: string;
  readonly op: 'LOG1' | 'LOG4';
};

export type TraceItemSelfDestruct = {
  readonly tag: 'NATIVE';
  readonly beneficiary: string;
  readonly value: string;
  readonly op: 'SELFDESTRUCT';
  readonly balanceChange: BalanceChange;
};

export type TraceItemCallInfo = {
  readonly tag: 'NATIVE';
  readonly op: 'CALL' | 'DELEGATECALL' | 'CREATE' | 'CREATE2';
  readonly address: string;
  readonly data: string;
  readonly value: string;
  readonly gas: string;
  readonly success: boolean;
  readonly items: readonly TraceItem[];
};

export type TraceItemSuccessfulCallInfo = TraceItemCallInfo & {
  readonly success: true;
  readonly balanceChange: BalanceChange;
};

export type TraceItemFailedCallInfo = TraceItemCallInfo & {
  readonly success: false;
  readonly balanceChange: null;
  readonly revertInfo: string;
};

export type TraceItem =
  | TraceItemSuccessfulCallInfo
  | TraceItemFailedCallInfo
  | TraceItemLog
  | TraceItemErc20Transfer
  | TraceItemErc721Transfer
  | TraceItemSelfDestruct;

export type TransactionBase = {
  readonly gasUsed: string;
  readonly gasLimit: string;
  readonly gasPrice: string;
  readonly minerReward: string;
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

export type UncleReward = {
  readonly uncleCoinbase: string;
  readonly reward: string;
};

export type BlockBase = {
  readonly timestamp: number;
  readonly coinbase: string;
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

export type BlockTrace = BlockBase &
  BlockHeader & {
    readonly blockHash: string;
    readonly parentBlockHash: string;
    readonly blockNumber: number;
    readonly gasLimit: string;
    readonly minerReward: string;
    readonly uncleRewards: readonly UncleReward[];
    readonly txs: readonly TransactionTrace[];
  };