/**
 * @module - supposed to mirror the go types
 * @see https://github.com/parsiq/parsiq-solana-hclient/blob/main/types.go
 *
 * note that effective API format may change with time, so this file may happen to be
 * out of date, so it should be updated from time to time, preferably with a script
 * @see https://github.com/tkrajina/typescriptify-golang-structs
 */

type uint8 = number;
type uint16 = number;
type uint32 = number;
type uint64 = number;
type float64 = number;

type SolanaRpcRequest = {
  jsonrpc: string; // Version
  id: uint64; // Id
  method: string; // Method
  params?: unknown[]; // Params
};

type SolanaBaseRpcResponse = {
  error: {
    // Error
    code: int; // Code
    message: string; // Message
  };
  id: int; // Id
};

type GetConfirmedBlockResp = SolanaBaseRpcResponse & {
  result: SolanaBlock; // Result
};

type GetTokenLargestAccountsResp = SolanaBaseRpcResponse & {
  result: TokenLargestAccount; // Result
};

type GetTokenSupplyResp = SolanaBaseRpcResponse & {
  result: TokenAccountBalance; // Result
};

type GetLeaderScheduleResp = SolanaBaseRpcResponse & {
  result?: unknown; // Result
};

type GetIdentityResp = SolanaBaseRpcResponse & {
  result: {
    // Result
    identity: string; // Identity
  };
};

type GetConfirmedBlocksWithLimitResp = SolanaBaseRpcResponse & {
  result: uint64[]; // Result
};

type GetFirstAvailableBlockResp = SolanaBaseRpcResponse & {
  result: uint64; // Result
};

type GetEpochInfoResp = SolanaBaseRpcResponse & {
  result: EpochInfo; // Result
};

type GetAccountInfoResp = SolanaBaseRpcResponse & {
  result: AccountInfo; // Result
};

type GetFeeCalculatorForBlockhashResp = {
  result?: unknown; // Result
};

type GetGenesisHashResp = SolanaBaseRpcResponse & {
  result: string; // Result
};

type GetBalanceResp = SolanaBaseRpcResponse & {
  result: Balance; // Result
};

type GetMultipleAccountsResp = SolanaBaseRpcResponse & {
  result: MultipleAccounts; // Result
};

type GetMinimumBalanceForRentExemptionResp = SolanaBaseRpcResponse & {
  result: uint64; // Result
};

type GetInflationGovernorResp = SolanaBaseRpcResponse & {
  result: InflationGovernor; // Result
};

type GetClusterNodesResp = SolanaBaseRpcResponse & {
  result: ClusterNodes[]; // Result
};

type GetInflationRateResp = SolanaBaseRpcResponse & {
  result: InflationRate; // Result
};

type GetLargestAccountsResp = SolanaBaseRpcResponse & {
  result: LargestAccounts; // Result
};

type GetFeesResp = SolanaBaseRpcResponse & {
  result: Fees; // Result
};

type SendTransactionResp = SolanaBaseRpcResponse & {
  result: string; // Result
};

type SimulateTransactionResp = SolanaBaseRpcResponse & {
  result: SimulateTransaction; // Result
};

type GetTokenAccountBalanceResp = SolanaBaseRpcResponse & {
  result: TokenAccountBalance; // Result
};

type GetTokenAccountsResp = SolanaBaseRpcResponse & {
  result: TokenAccounts; // Result
};

type GetConfirmedSignaturesForAddressResp = SolanaBaseRpcResponse & {
  result: ConfirmedSignaturesForAddress[]; // Result
};

type GetBlockTimeResp = SolanaBaseRpcResponse & {
  result: int64; // Result
};

type GetStakeActivationResp = SolanaBaseRpcResponse & {
  result: StakeActivation; // Result
};

type GetSlotResp = SolanaBaseRpcResponse & {
  result: uint64; // Result
};

type GetSlotLeaderResp = SolanaBaseRpcResponse & {
  result: string; // Result
};

type GetFeeRateGovernorResp = SolanaBaseRpcResponse & {
  result: FeeRateGovernor; // Result
};

type GetSupplyResp = SolanaBaseRpcResponse & {
  result: Supply; // Result
};

type GetProgramAccountsResp = SolanaBaseRpcResponse & {
  result: ProgramAccounts[]; // Result
};

type GetRecentBlockHashResp = SolanaRpcClient & {
  result: RecentBlockHash; // Result
};

type GetBlockCommitmentResp = SolanaBaseRpcResponse & {
  result: BlockCommitment; // Result
};

type BlockCommitment = {
  commitment: uint64[]; // Commitment
  totalStake: uint64; // TotalStake
};

type StakeActivation = {
  state: string; // State
  active: uint64; // Active
  inactive: uint64; // Inactive
};

type ConfirmedSignaturesForAddress = {
  signature: string; // Signature
  slot: uint64; // Slot
  err?: unknown; // Err
  memo: string; // Memo
};

type ConfirmedSignaturesParams = {
  limit: uint16; // Limit //1-1000, default 1000
  before: string; // Before
  until: string; // Until
};

type Limit = {
  limit: uint16; // Limit
};

type Before = {
  before: string; // Before
};

type Until = {
  until: string; // Until
};

type InflationGovernor = {
  initial: float64; // Initial
  terminal: float64; // Terminal
  taper: float64; // Taper
  foundation: float64; // Foundation
  foundationTerm: float64; // FoundationTerm
};

type InflationRate = {
  total: float64; // Total
  validator: float64; // Validator
  foundation: float64; // Foundation
  epoch: float64; // Epoch
};

type StakeActivationParam = {
  commitment: string; // Commitment
  epoch: uint64; // Epoch
};

type FeeRateGovernor = {
  context: {
    // Context
    slot: uint64; // Slot
  };
  Value: {
    feeRateGovernor: {
      // FeeRateGovernor
      burnPercent: uint8; // BurnPercent
      maxLamportsPerSignature: uint64; // MaxLamportsPerSignature
      minLamportsPerSignature: uint64; // MinLamportsPerSignature
      targetLamportsPerSignature: uint64; // TargetLamportsPerSignature
      targetSignaturesPerSlot: uint64; // TargetSignaturesPerSlot
    };
  };
};

type Supply = {
  context: {
    // Context
    slot: uint64; // Slot
  };
  Value: {
    total: uint64; // Total
    circulating: uint64; // Circulating
    nonCirculating: uint64; // NonCirculating
    nonCirculatingAccounts: string[]; // NonCirculatingAccounts
  };
};

type SimulateTransaction = {
  context: {
    // Context
    slot: uint64; // Slot
  };
  value: {
    err?: unknown; // Err
    logs: string[]; // Logs
  };
};

type LeadersSchedule = {
  Slot: uint64;
  Commitment: string;
};

type TokenAccountBalance = {
  context: {
    // Context
    slot: uint64; // Slot
  };
  value: {
    // Value
    uiAmount: float64; // UiAmount
    amount: string; // Amount
    decimals: uint8; // Decimals
  };
};

type TokenLargestAccount = {
  context: {
    // Context
    slot: uint64; // Slot
  };
  value: {
    address: string; // Address
    uiAmount: float64; // UiAmount
    amount: string; // Amount
    decimals: uint8; // Decimals
  }[];
};

type Mint = {
  mint: string; // Mint
};

type ProgramID = {
  programId: string; // ProgramID
};

type TokenAccounts = {
  context: {
    // Context
    slot: uint64; // Slot
  };
  value: {
    pubKey: string; // PubKey
    account: {
      // Account
      lamports: uint64; // Lamports
      owner: string; // Owner
      data?: unknown; // Data
      executable: boolean; // Executable
      rentEpoch: uint64; // RentEpoch
    };
  }[];
};

type Fees = {
  context: {
    // Context
    slot: uint64; // Slot
  };
  Value: {
    blockhash: string; // Blockhash
    feeCalculator: {
      // FeeCalculator
      lamportsPerSignature: uint64; // LamportsPerSignature
    };
    lastValidSlot: uint64; // LastValidSlot
  };
};

type Balance = {
  context: {
    // Context
    slot: uint64; // Slot
  };
  value: uint64; // Value
};

type ProgramAccounts = {
  pubKey: string; // PubKey
  account: {
    lamports: uint64; // Lamports
    owner: string; // Owner
    executable: boolean; // Executable
    rentEpoch: uint64; // RentEpoch
  };
};

type RecentBlockHash = {
  context: {
    // Context
    slot: uint64; // Slot
  };
  value: {
    // Value
    RpcResponse?: unknown; // RpcResponse
    blockhash: string; // BlockHash
    feeCalculator?: unknown; // FeeCalculator
  };
};

type LargestAccounts = {
  context: {
    // Context
    slot: uint64; // Slot
  };
  value: {
    lamports: uint64; // Lamports
    address: string; // Address
  }[];
};

type LargestAccountsParams = {
  commitment: string; // Commitment
  filter: string; // Filter
};

type AccountInfoParams = {
  commitment: string; // Commitment
  encoding: string; // Encoding
  dataSlice: {
    // DataSlice
    offset: uint; // Offset
    length: uint; // Length
  };
};

type ProgramAccountParams = {
  commitment: string; // Commitment
  encoding: string; // Encoding
  dataSlice: {
    // DataSlice
    offset: uint; // Offset
    length: uint; // Length
  };
  filters: Filter[]; // Filters
};

type Filter = {
  memcmp: {
    // Memcmp
    offset: uint64; // Offset
    bytes: string; // Bytes
  };
  dataSize: uint64; // DataSize
};

type ClusterNodes = {
  gossip: string; // Gossip
  pubkey: string; // Pubkey
  rpc: string; // Rpc
  tpu: string; // Tpu
  version: string; // Version
};

/** @see https://docs.solana.com/developing/clients/jsonrpc-api#configuring-state-commitment */
type Commitment = {
  commitment: string; // Commitment
};

type SimulateTransactionParam = {
  sigVerify: boolean; // SigVerify
  commitment: string; // Commitment
  encoding: string; // Encoding
};

type SendTransactionParams = {
  skipPreflight: boolean; // SkipPreflight
  preflightCommitment: string; // PreflightCommitment
  encoding: string; // Encoding
};

type AccountInfo = {
  context: {
    // Context
    slot: uint64; // Slot
  };
  value: {
    // Value
    data?: unknown; // Data
    executable: boolean; // Executable
    lamports: uint64; // Lamports
    owner: string; // Owner
    rentEpoch: uint64; // RentEpoch
  };
};

type MultipleAccounts = {
  context: {
    // Context
    slot: uint64; // Slot
  };
  value: {
    data?: unknown; // Data
    executable: boolean; // Executable
    lamports: uint64; // Lamports
    owner: string; // Owner
    rentEpoch: uint64; // RentEpoch
  }[];
};

type EpochInfo = {
  absoluteSlot: uint64; // AbsoluteSlot
  blockHeight: uint64; // BlockHeight
  epoch: uint64; // Epoch
  slotIndex: uint64; // SlotIndex
  slotsInEpoch: uint64; // SlotsInEpoch
};

type SolanaBlockHead = {
  blockTime: uint64; // BlockTime
  blockhash: string; // Blockhash
  parentSlot: uint64; // ParentSlot
  previousBlockhash: string; // PreviousBlockhash
  rewards: {
    lamports: uint64; // Lamports
    postBalance: uint64; // PostBalance
    pubkey: string; // Pubkey
    rewardType: string; // RewardType
  }[];
};

type SolanaBlockHeadersListItem = {
  slotNumber: number;
  block: SolanaBlockHead | null;
  size: number;
};

export type SolanaBlock = SolanaBlockHead & {
  transactions: SolanaTransaction[]; // Transactions
};

type SolanaTransaction = {
  meta: {
    // Meta
    err?: unknown; // Err
    fee: uint64; // Fee
    innerInstructions?: unknown[]; // InnerInstructions
    logMessages: string[]; // LogMessages
    preBalances: uint64[]; // PreBalances
    postBalances: uint64[]; // PostBalances
    preTokenBalances: {
      accountIndex: uint16; // AccountIndex
      mint: string; // Mint
      uiTokenAmount: {
        // UiTokenAmount
        amount: string; // Amount
        decimals: uint8; // Decimals
        uiAmount: float64; // UiAmount
      };
    }[];
    postTokenBalances: {
      accountIndex: uint16; // AccountIndex
      mint: string; // Mint
      uiTokenAmount: {
        // UiTokenAmount
        amount: string; // Amount
        decimals: uint8; // Decimals
        uiAmount: float64; // UiAmount
      };
    }[];
    status: {
      // Status
      Ok?: unknown; // Ok
    };
  };
  transaction: {
    // Transaction
    message: {
      // Message
      accountKeys: string[]; // AccountKeys
      header: {
        // Header
        numReadonlySignedAccounts: uint16; // NumReadonlySignedAccounts
        numReadonlyUnsignedAccounts: uint16; // NumReadonlyUnsignedAccounts
        numRequiredSignatures: uint16; // NumRequiredSignatures
      };
      instructions: {
        accounts: uint16[]; // Accounts
        data: string; // Data
        programIdIndex: uint16; // ProgramIDIndex
      }[];
      recentBlockhash: string; // RecentBlockhash
    };
    signatures: string[]; // Signatures
  };
};
