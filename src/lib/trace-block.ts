import {
  BlockBase,
  BlockHeader,
  BlockReward,
  BlockTrace,
  TraceItem,
  TransactionBase,
  TransactionTrace,
} from './block-trace.type';

const BlockHeader = {
  fromTrace({
    header: {
      gasUsed,
      gasLimit,
      baseFeePerGas,
      sha3Uncles,
      extraData,
      mixHash,
      nonce,
      logsBloom,
      stateRoot,
      transactionsRoot,
      receiptsRoot,
    },
  }: BlockTrace): BlockHeader {
    return {
      gasUsed,
      gasLimit,
      baseFeePerGas,
      sha3Uncles,
      extraData,
      mixHash,
      nonce,
      logsBloom,
      stateRoot,
      transactionsRoot,
      receiptsRoot,
    };
  },
};

export type Decoder<T> = (item: TraceItem, contract: string) => T;

export type TraceOptions<T> = {
  includeFailed: boolean;
  decoder: Decoder<T>;
};

export type Block<T> = BlockBase & {
  readonly number: number;
  readonly hash: string;
  readonly parentHash: string;
  readonly coinbase: string;
  readonly header: BlockHeader;
  readonly rewards: readonly BlockReward[];
  readonly traceOptions: TraceOptions<T>;
};

const Block = {
  fromTrace<T>(blockTrace: BlockTrace, traceOptions: TraceOptions<T>): Block<T> {
    const header = BlockHeader.fromTrace(blockTrace);

    return {
      header,
      rewards: blockTrace.rewards,
      number: blockTrace.header.blockNumber,
      hash: blockTrace.header.blockHash,
      parentHash: blockTrace.header.parentBlockHash,
      coinbase: blockTrace.rewards[0]?.beneficiary,
      difficulty: blockTrace.header.difficulty,
      timestamp: blockTrace.header.timestamp,
      traceOptions,
    };
  },
};

export const CONTEXT = Symbol('transaction context');

export type TraceMessage<T> = {
  readonly msg: Message<T>;
  readonly tx: Transaction<T>;
  readonly block: Block<T>;
};

export type Message<T> = {
  contract: string;
  effective: boolean;
  parent: Message<T>;
  internal: boolean;
  level: number;
  sender: string;
  index: number;
  op: TraceItem['op'];
  decoded: T;
  data?: string;
  topics?: string[];
  value?: string;
};

export type Transaction<T> = TransactionBase & {
  readonly index: number;
  readonly hash: string;
  readonly blockHash: string;
  readonly [CONTEXT]: TransactionContext<T>;
};

export type TransactionContext<T> = {
  readonly item: TraceItem;
  readonly index: number;
  readonly nextIndex: () => number;
  readonly block: Block<T>;
};

const Transaction = {
  fromTrace<T>(
    {
      gasLimit,
      gasPrice,
      gasUsed,
      gasFeeCap,
      gasTipCap,
      txType,
      txnFeeSavings,
      fee,
      nonce,
      origin,
      sigR,
      sigS,
      sigV,
      txHash,
      gasRange,
    }: TransactionTrace,
    context: TransactionContext<T>
  ): Transaction<T> {
    return {
      gasLimit,
      gasPrice,
      gasUsed,
      gasRange,
      gasFeeCap,
      gasTipCap,
      txType,
      txnFeeSavings,
      origin,
      nonce,
      fee,
      sigR,
      sigS,
      sigV,
      hash: txHash,
      blockHash: context.block.hash,
      index: context.index,
      [CONTEXT]: context,
    };
  },
};

function NoDecoder() {
  return null;
}

export function traceBlock<T = never>(blockTrace: BlockTrace, traceOptions: Partial<TraceOptions<T>> = {}) {
  const options: TraceOptions<T> = Object.assign(
    {
      includeFailed: false,
      decoder: NoDecoder,
    },
    traceOptions
  );

  const block = Block.fromTrace(blockTrace, options);
  let index = 0;
  function nextIndex() {
    return index++;
  }
  return blockTrace.txs.map((txTrace, index) =>
    Transaction.fromTrace(txTrace, {
      item: txTrace.item,
      index,
      block,
      nextIndex,
    })
  );
}

type FirstLevelMessage = Message<never> & {
  contract: string;
  effective: true;
  parent: null;
  internal: null;
  level: -1;
};

export function traceTx<T>(
  tx: Transaction<T>,
  transactionTraceOptions: Record<string, unknown> = {}
): readonly TraceMessage<T>[] {
  const context = tx[CONTEXT];

  const { item, nextIndex, block } = context;
  const { includeFailed, decoder } = { ...block.traceOptions, ...transactionTraceOptions };

  let msg: Message<T> = {
    contract: tx.origin,
    effective: true,
    parent: null,
    internal: null,
    level: -1,
  } as FirstLevelMessage;

  function makeMessage<U extends Pick<Message<T>, 'contract' | 'op' | 'decoded'>>(
    parent: Message<T>,
    props: U
  ): Message<T> & U {
    return {
      effective: parent.effective,
      ...props,
      sender: parent.contract,
      internal: parent.internal !== null,
      level: parent.level + 1,
      parent,
      index: nextIndex(),
    };
  }

  function getContract(item: TraceItem): string {
    switch (item.op) {
      case 'LOG0':
      case 'LOG1':
      case 'LOG2':
      case 'LOG3':
      case 'LOG4':
        return msg.contract;
      case 'SELFDESTRUCT':
        return item.beneficiary;
      case 'CALL':
      case 'DELEGATECALL':
      case 'CREATE':
      case 'CREATE2':
      default:
        return item.address;
    }
  }

  function* process(item: TraceItem): Generator<TraceMessage<T>> {
    const contract = getContract(item);
    msg = makeMessage(msg, {
      effective: msg.effective && ('result' in item ? item.result !== null && item.result.success : true),
      contract,
      op: item.op,
      decoded: decoder(item, contract),
      gasRange: 'gasRange' in item ? item.gasRange : undefined,
      data: 'data' in item ? item.data : undefined,
      topics: 'topics' in item ? item.topics : undefined,
      value: 'value' in item ? item.value : undefined,
    });
    try {
      if (msg.effective || includeFailed) {
        yield { msg, tx, block };
        const subItems = 'items' in item && Array.isArray(item.items) ? item.items : [];
        for (const subItem of subItems) {
          yield* process(subItem);
        }
      }
    } finally {
      msg = msg.parent;
    }
  }

  const items = [];
  for (const processed of process(item)) {
    items.push(processed);
  }
  return items;
}
