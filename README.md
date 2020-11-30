# BlockTracer

Traverse through block trace to gather events, transfers and other transaction info.

## Example usage

```typescript
for (const tx of traceBlock(blockTraceFromParsiqBSC)) {
    for (const {  msg, tx, block } of traceTx(tx)) {
      console.log('block', block); // block info (headers, hash, timestamp, number etc)
      console.log('transaction', tx); // tx info (origin, gas, hash, signature etc)
      console.log('message', msg); // internal tx message (contract, value, data, topics etc)
    }
  }
```
