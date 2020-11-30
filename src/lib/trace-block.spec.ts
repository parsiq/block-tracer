import test from 'ava';

import * as blockTraceFixture from '../fixtures/block-trace.json';

import { BlockTrace, TraceItem } from './block-trace.type';
import { traceBlock, traceTx } from './trace-block';

test('trace', (t) => {
  let count = 0;

  for (const transaction of traceBlock(blockTraceFixture as BlockTrace)) {
    for (const { msg, tx, block } of traceTx(transaction)) {
      count++;
      t.is(block.hash, '0xa24b24e0ad3973116ad5b0152a261a8419c8772ac226bc430ef25df992d12484');
      t.is(tx.blockHash, block.hash);
      t.is(block.header.transactionsRoot, '0xd885273d89ff9c4dff02ac09bcdde5b7d84b767ea3449be4da6c03c43942cfaa');
      t.truthy(tx.gasLimit);
      console.log('transactionIndex:', tx.index, 'msgLevel:', msg.level, 'msgIndex:', msg.index);
    }
  }
  t.is(count, 14);
});

test('traces events', (t) => {
  t.plan(1);

  const traceOptions = {
    decoder: (item: TraceItem, contract: string) => {
      if (
        contract === '0x0000000000000000000000000000000000001000' &&
        item.op === 'LOG2' &&
        item.topics[0] === '0x93a090ecc682c002995fad3c85b30c5651d7fd29b0be5da9d784a3302aedc055'
      ) {
        return {
          event: 'validatorDeposit',
          validator: '0x'.concat(item.topics[1].slice(-40)),
          amount: parseInt(item.data, 16),
          contract: 'BSCValidatorSet',
        };
      }

      return null;
    },
  };

  for (const transaction of traceBlock(blockTraceFixture as BlockTrace, traceOptions)) {
    for (const { msg } of traceTx(transaction)) {
      if (msg.decoded !== null) {
        t.like(msg.decoded, {
          event: 'validatorDeposit',
          validator: '0xf474cf03cceff28abc65c9cbae594f725c80e12d',
          amount: 2023320000000000,
          contract: 'BSCValidatorSet',
        });
      }
    }
  }
});
