import { BlockBase, BlockHeader, BlockTrace, TraceItem, TransactionBase, TransactionTrace } from './block-trace.type';

export type Reward = {
  readonly coinbase: string;
  readonly reward: string;
};

const BlockHeader = {
  fromTrace({
    gasUsed,
    sha3Uncles,
    extraData,
    mixHash,
    nonce,
    logsBloom,
    stateRoot,
    transactionsRoot,
    receiptsRoot,
  }: BlockTrace): BlockHeader {
    return {
      gasUsed,
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

export type Logger = {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
};

export type CustomItemTracer<T> = (options: {
  logger: Logger;
}) => (payload: {
  item: TraceItem;
  tx: Transaction<T>;
  block: Block<T>;
  parent: Message;
  logger: Logger;
  includeFailed: boolean;
  makeMessage: MakeMessage;
}) => Generator<T>;

export type MakeMessage = (
  parent: Message,
  props: Partial<Message> & Pick<Message, 'contract' | 'tag' | 'native'>
) => Message;

export type TraceOptions<T> = {
  logger: Logger;
  custom: CustomItemTracer<T>;
  includeFailed: boolean;
  decoder: (item: TraceItem, contract: string) => any;
};

export type Block<T> = BlockBase & {
  readonly number: number;
  readonly hash: string;
  readonly parentHash: string;
  readonly header: BlockHeader;
  readonly rewards: readonly Reward[];
  readonly traceOptions: TraceOptions<T>;
};

const Block = {
  fromTrace<T>(blockTrace: BlockTrace, traceOptions: TraceOptions<T>): Block<T> {
    const header = BlockHeader.fromTrace(blockTrace);
    const rewards: Reward[] = [{ coinbase: blockTrace.coinbase, reward: blockTrace.minerReward }].concat(
      blockTrace.uncleRewards.map(({ reward, uncleCoinbase }) => ({ coinbase: uncleCoinbase, reward }))
    );

    return {
      header,
      rewards,
      number: blockTrace.blockNumber,
      hash: blockTrace.blockHash,
      parentHash: blockTrace.parentBlockHash,
      coinbase: blockTrace.coinbase,
      difficulty: blockTrace.difficulty,
      timestamp: blockTrace.timestamp,
      traceOptions,
    };
  },
};

export const CONTEXT = Symbol('transaction context');

export type TraceMessage<T> = {
  readonly msg: Message | T;
  readonly tx: Transaction<T>;
  readonly index: number;
  readonly block: Block<T>;
};

export type Message = {
  contract: string;
  effective: boolean;
  parent: Message;
  internal: boolean;
  level: number;
  sender: string;
  index: number;
  native: {
    op: TraceItem['op'];
    decoded: any;
  };
  tag: TraceItem['tag'];
  data?: string;
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
    { gasLimit, gasPrice, gasUsed, minerReward, nonce, origin, sigR, sigS, sigV, txHash }: TransactionTrace,
    context: TransactionContext<T>
  ): Transaction<T> {
    return {
      gasLimit,
      gasPrice,
      gasUsed,
      origin,
      nonce,
      minerReward,
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

function NoCustomEvents({ logger }: { logger: Logger }) {
  // eslint-disable-next-line require-yield
  return function* (item: any) {
    logger.error('Processing custom items is not configured', item);
  };
}

function NoDecoder() {
  return null;
}

export function traceBlock<T = never>(blockTrace: BlockTrace, traceOptions: Partial<TraceOptions<T>> = {}) {
  const options: TraceOptions<T> = Object.assign(
    {
      custom: NoCustomEvents,
      logger: console,
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

type FirstLevelMessage = Message & {
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

  const { item, index, nextIndex, block } = context;
  const { logger, custom, includeFailed, decoder } = { ...block.traceOptions, ...transactionTraceOptions };
  const customProcess = custom({ logger });

  let msg: Message = {
    contract: tx.origin,
    effective: true,
    parent: null,
    internal: null,
    level: -1,
  } as FirstLevelMessage;

  function makeMessage<U extends Pick<Message, 'contract' | 'tag' | 'native'>>(parent: Message, props: U): Message & U {
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
        return msg.internal ? msg.parent.contract : msg.contract;
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
    if (item.tag === 'NATIVE') {
      const contract = getContract(item);
      msg = makeMessage(msg, {
        effective: msg.effective && 'success' in item ? item.success : true,
        contract,
        native: {
          op: item.op,
          decoded: decoder(item, contract),
        },
        tag: item.tag,
        data: 'data' in item ? item.data : undefined,
        value: 'value' in item ? item.value : undefined,
      });
      try {
        if (msg.effective || includeFailed) {
          yield { msg, tx, index, block };
          const subItems = 'items' in item ? item.items : [];
          for (const subItem of subItems) {
            yield* process(subItem);
          }
        }
      } finally {
        msg = msg.parent;
      }
    } else {
      const parent = msg;
      for (const msg of customProcess({
        item,
        tx,
        block,
        parent,
        logger,
        includeFailed,
        makeMessage,
      })) {
        yield { msg, tx, index, block };
      }
    }
  }

  const items = [];
  for (const processed of process(item)) {
    items.push(processed);
  }
  return items;
}
