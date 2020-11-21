import test from 'ava';

import * as blockTraceFixture from '../fixtures/block-trace.json';

import { BlockTrace } from './block-trace.type';
import { traceBlock, TraceOptions, traceTx } from './trace-block';

test('trace', (t) => {
  let count = 0;

  for (const transaction of traceBlock(blockTraceFixture as BlockTrace)) {
    for (const { index, msg, tx, block } of traceTx(transaction)) {
      count++;
      t.is(block.hash, '0xe18ea7f82d488c606fc4c307f0111feaa293f6567456b449b06c94d3e5d786f0');
      t.is(tx.blockHash, block.hash);
      t.is(block.header.transactionsRoot, '0xb9b3a274b27e6ab02539db19315fa31f221d4cd7d0d8a8a48f2185d2f5e34199');
      t.is(tx.index, index);
      t.truthy(tx.gasLimit);
      console.log('transactionIndex:', index, 'msgLevel:', msg.level, 'msgIndex:', msg.index);
    }
  }
  t.is(count, 14);
});

test('traces events', (t) => {
  t.plan(1);

  const decoder: TraceOptions<never>['decoder'] = (item, contract) => {
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
  };

  for (const transaction of traceBlock(blockTraceFixture as BlockTrace, { decoder })) {
    for (const { msg } of traceTx(transaction)) {
      if (msg.native.decoded !== null) {
        t.like(msg.native.decoded, {
          event: 'validatorDeposit',
          validator: '0xa2959d3f95eae5dc7d70144ce1b73b403b7eb6e0',
          amount: 7908516000000000,
          contract: 'BSCValidatorSet',
        });
      }
    }
  }
});
