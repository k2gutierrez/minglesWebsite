import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwner = {
    $$type: 'ChangeOwner';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwner(src: ChangeOwner) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2174598809, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwner(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2174598809) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadTupleChangeOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function storeTupleChangeOwner(source: ChangeOwner) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwner(): DictionaryValue<ChangeOwner> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwner(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwner(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwnerOk = {
    $$type: 'ChangeOwnerOk';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwnerOk(src: ChangeOwnerOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(846932810, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwnerOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 846932810) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadTupleChangeOwnerOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwnerOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function storeTupleChangeOwnerOk(source: ChangeOwnerOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwnerOk(): DictionaryValue<ChangeOwnerOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwnerOk(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwnerOk(src.loadRef().beginParse());
        }
    }
}

export type Transfer = {
    $$type: 'Transfer';
    to: Address;
}

export function storeTransfer(src: Transfer) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1294203785, 32);
        b_0.storeAddress(src.to);
    };
}

export function loadTransfer(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1294203785) { throw Error('Invalid prefix'); }
    const _to = sc_0.loadAddress();
    return { $$type: 'Transfer' as const, to: _to };
}

export function loadTupleTransfer(source: TupleReader) {
    const _to = source.readAddress();
    return { $$type: 'Transfer' as const, to: _to };
}

export function loadGetterTupleTransfer(source: TupleReader) {
    const _to = source.readAddress();
    return { $$type: 'Transfer' as const, to: _to };
}

export function storeTupleTransfer(source: Transfer) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.to);
    return builder.build();
}

export function dictValueParserTransfer(): DictionaryValue<Transfer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTransfer(src)).endCell());
        },
        parse: (src) => {
            return loadTransfer(src.loadRef().beginParse());
        }
    }
}

export type StickerItem$Data = {
    $$type: 'StickerItem$Data';
    owner: Address;
    collection: Address;
    index: bigint;
    uri: string;
}

export function storeStickerItem$Data(src: StickerItem$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.collection);
        b_0.storeInt(src.index, 257);
        b_0.storeStringRefTail(src.uri);
    };
}

export function loadStickerItem$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _collection = sc_0.loadAddress();
    const _index = sc_0.loadIntBig(257);
    const _uri = sc_0.loadStringRefTail();
    return { $$type: 'StickerItem$Data' as const, owner: _owner, collection: _collection, index: _index, uri: _uri };
}

export function loadTupleStickerItem$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _collection = source.readAddress();
    const _index = source.readBigNumber();
    const _uri = source.readString();
    return { $$type: 'StickerItem$Data' as const, owner: _owner, collection: _collection, index: _index, uri: _uri };
}

export function loadGetterTupleStickerItem$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _collection = source.readAddress();
    const _index = source.readBigNumber();
    const _uri = source.readString();
    return { $$type: 'StickerItem$Data' as const, owner: _owner, collection: _collection, index: _index, uri: _uri };
}

export function storeTupleStickerItem$Data(source: StickerItem$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.collection);
    builder.writeNumber(source.index);
    builder.writeString(source.uri);
    return builder.build();
}

export function dictValueParserStickerItem$Data(): DictionaryValue<StickerItem$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStickerItem$Data(src)).endCell());
        },
        parse: (src) => {
            return loadStickerItem$Data(src.loadRef().beginParse());
        }
    }
}

export type SetSaleActive = {
    $$type: 'SetSaleActive';
    active: boolean;
}

export function storeSetSaleActive(src: SetSaleActive) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3181244601, 32);
        b_0.storeBit(src.active);
    };
}

export function loadSetSaleActive(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3181244601) { throw Error('Invalid prefix'); }
    const _active = sc_0.loadBit();
    return { $$type: 'SetSaleActive' as const, active: _active };
}

export function loadTupleSetSaleActive(source: TupleReader) {
    const _active = source.readBoolean();
    return { $$type: 'SetSaleActive' as const, active: _active };
}

export function loadGetterTupleSetSaleActive(source: TupleReader) {
    const _active = source.readBoolean();
    return { $$type: 'SetSaleActive' as const, active: _active };
}

export function storeTupleSetSaleActive(source: SetSaleActive) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.active);
    return builder.build();
}

export function dictValueParserSetSaleActive(): DictionaryValue<SetSaleActive> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetSaleActive(src)).endCell());
        },
        parse: (src) => {
            return loadSetSaleActive(src.loadRef().beginParse());
        }
    }
}

export type MintPack = {
    $$type: 'MintPack';
    uri0: string;
    uri1: string;
    uri2: string;
    uri3: string;
    uri4: string;
    uri5: string;
    uri6: string;
    uri7: string;
    uri8: string;
    uri9: string;
}

export function storeMintPack(src: MintPack) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(396571110, 32);
        b_0.storeStringRefTail(src.uri0);
        b_0.storeStringRefTail(src.uri1);
        const b_1 = new Builder();
        b_1.storeStringRefTail(src.uri2);
        b_1.storeStringRefTail(src.uri3);
        b_1.storeStringRefTail(src.uri4);
        const b_2 = new Builder();
        b_2.storeStringRefTail(src.uri5);
        b_2.storeStringRefTail(src.uri6);
        b_2.storeStringRefTail(src.uri7);
        const b_3 = new Builder();
        b_3.storeStringRefTail(src.uri8);
        b_3.storeStringRefTail(src.uri9);
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadMintPack(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 396571110) { throw Error('Invalid prefix'); }
    const _uri0 = sc_0.loadStringRefTail();
    const _uri1 = sc_0.loadStringRefTail();
    const sc_1 = sc_0.loadRef().beginParse();
    const _uri2 = sc_1.loadStringRefTail();
    const _uri3 = sc_1.loadStringRefTail();
    const _uri4 = sc_1.loadStringRefTail();
    const sc_2 = sc_1.loadRef().beginParse();
    const _uri5 = sc_2.loadStringRefTail();
    const _uri6 = sc_2.loadStringRefTail();
    const _uri7 = sc_2.loadStringRefTail();
    const sc_3 = sc_2.loadRef().beginParse();
    const _uri8 = sc_3.loadStringRefTail();
    const _uri9 = sc_3.loadStringRefTail();
    return { $$type: 'MintPack' as const, uri0: _uri0, uri1: _uri1, uri2: _uri2, uri3: _uri3, uri4: _uri4, uri5: _uri5, uri6: _uri6, uri7: _uri7, uri8: _uri8, uri9: _uri9 };
}

export function loadTupleMintPack(source: TupleReader) {
    const _uri0 = source.readString();
    const _uri1 = source.readString();
    const _uri2 = source.readString();
    const _uri3 = source.readString();
    const _uri4 = source.readString();
    const _uri5 = source.readString();
    const _uri6 = source.readString();
    const _uri7 = source.readString();
    const _uri8 = source.readString();
    const _uri9 = source.readString();
    return { $$type: 'MintPack' as const, uri0: _uri0, uri1: _uri1, uri2: _uri2, uri3: _uri3, uri4: _uri4, uri5: _uri5, uri6: _uri6, uri7: _uri7, uri8: _uri8, uri9: _uri9 };
}

export function loadGetterTupleMintPack(source: TupleReader) {
    const _uri0 = source.readString();
    const _uri1 = source.readString();
    const _uri2 = source.readString();
    const _uri3 = source.readString();
    const _uri4 = source.readString();
    const _uri5 = source.readString();
    const _uri6 = source.readString();
    const _uri7 = source.readString();
    const _uri8 = source.readString();
    const _uri9 = source.readString();
    return { $$type: 'MintPack' as const, uri0: _uri0, uri1: _uri1, uri2: _uri2, uri3: _uri3, uri4: _uri4, uri5: _uri5, uri6: _uri6, uri7: _uri7, uri8: _uri8, uri9: _uri9 };
}

export function storeTupleMintPack(source: MintPack) {
    const builder = new TupleBuilder();
    builder.writeString(source.uri0);
    builder.writeString(source.uri1);
    builder.writeString(source.uri2);
    builder.writeString(source.uri3);
    builder.writeString(source.uri4);
    builder.writeString(source.uri5);
    builder.writeString(source.uri6);
    builder.writeString(source.uri7);
    builder.writeString(source.uri8);
    builder.writeString(source.uri9);
    return builder.build();
}

export function dictValueParserMintPack(): DictionaryValue<MintPack> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMintPack(src)).endCell());
        },
        parse: (src) => {
            return loadMintPack(src.loadRef().beginParse());
        }
    }
}

export type AirdropPack = {
    $$type: 'AirdropPack';
    to: Address;
    uri0: string;
    uri1: string;
    uri2: string;
    uri3: string;
    uri4: string;
    uri5: string;
    uri6: string;
    uri7: string;
    uri8: string;
    uri9: string;
}

export function storeAirdropPack(src: AirdropPack) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(376094636, 32);
        b_0.storeAddress(src.to);
        b_0.storeStringRefTail(src.uri0);
        b_0.storeStringRefTail(src.uri1);
        const b_1 = new Builder();
        b_1.storeStringRefTail(src.uri2);
        b_1.storeStringRefTail(src.uri3);
        b_1.storeStringRefTail(src.uri4);
        const b_2 = new Builder();
        b_2.storeStringRefTail(src.uri5);
        b_2.storeStringRefTail(src.uri6);
        b_2.storeStringRefTail(src.uri7);
        const b_3 = new Builder();
        b_3.storeStringRefTail(src.uri8);
        b_3.storeStringRefTail(src.uri9);
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadAirdropPack(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 376094636) { throw Error('Invalid prefix'); }
    const _to = sc_0.loadAddress();
    const _uri0 = sc_0.loadStringRefTail();
    const _uri1 = sc_0.loadStringRefTail();
    const sc_1 = sc_0.loadRef().beginParse();
    const _uri2 = sc_1.loadStringRefTail();
    const _uri3 = sc_1.loadStringRefTail();
    const _uri4 = sc_1.loadStringRefTail();
    const sc_2 = sc_1.loadRef().beginParse();
    const _uri5 = sc_2.loadStringRefTail();
    const _uri6 = sc_2.loadStringRefTail();
    const _uri7 = sc_2.loadStringRefTail();
    const sc_3 = sc_2.loadRef().beginParse();
    const _uri8 = sc_3.loadStringRefTail();
    const _uri9 = sc_3.loadStringRefTail();
    return { $$type: 'AirdropPack' as const, to: _to, uri0: _uri0, uri1: _uri1, uri2: _uri2, uri3: _uri3, uri4: _uri4, uri5: _uri5, uri6: _uri6, uri7: _uri7, uri8: _uri8, uri9: _uri9 };
}

export function loadTupleAirdropPack(source: TupleReader) {
    const _to = source.readAddress();
    const _uri0 = source.readString();
    const _uri1 = source.readString();
    const _uri2 = source.readString();
    const _uri3 = source.readString();
    const _uri4 = source.readString();
    const _uri5 = source.readString();
    const _uri6 = source.readString();
    const _uri7 = source.readString();
    const _uri8 = source.readString();
    const _uri9 = source.readString();
    return { $$type: 'AirdropPack' as const, to: _to, uri0: _uri0, uri1: _uri1, uri2: _uri2, uri3: _uri3, uri4: _uri4, uri5: _uri5, uri6: _uri6, uri7: _uri7, uri8: _uri8, uri9: _uri9 };
}

export function loadGetterTupleAirdropPack(source: TupleReader) {
    const _to = source.readAddress();
    const _uri0 = source.readString();
    const _uri1 = source.readString();
    const _uri2 = source.readString();
    const _uri3 = source.readString();
    const _uri4 = source.readString();
    const _uri5 = source.readString();
    const _uri6 = source.readString();
    const _uri7 = source.readString();
    const _uri8 = source.readString();
    const _uri9 = source.readString();
    return { $$type: 'AirdropPack' as const, to: _to, uri0: _uri0, uri1: _uri1, uri2: _uri2, uri3: _uri3, uri4: _uri4, uri5: _uri5, uri6: _uri6, uri7: _uri7, uri8: _uri8, uri9: _uri9 };
}

export function storeTupleAirdropPack(source: AirdropPack) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.to);
    builder.writeString(source.uri0);
    builder.writeString(source.uri1);
    builder.writeString(source.uri2);
    builder.writeString(source.uri3);
    builder.writeString(source.uri4);
    builder.writeString(source.uri5);
    builder.writeString(source.uri6);
    builder.writeString(source.uri7);
    builder.writeString(source.uri8);
    builder.writeString(source.uri9);
    return builder.build();
}

export function dictValueParserAirdropPack(): DictionaryValue<AirdropPack> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeAirdropPack(src)).endCell());
        },
        parse: (src) => {
            return loadAirdropPack(src.loadRef().beginParse());
        }
    }
}

export type StickerCollection$Data = {
    $$type: 'StickerCollection$Data';
    owner: Address;
    name: string;
    royaltyReceiver: Address;
    royaltyBps: bigint;
    pricePerItem: bigint;
    baseCid: string;
    maxSupply: bigint;
    nextIndex: bigint;
    saleActive: boolean;
}

export function storeStickerCollection$Data(src: StickerCollection$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeStringRefTail(src.name);
        b_0.storeAddress(src.royaltyReceiver);
        b_0.storeInt(src.royaltyBps, 257);
        const b_1 = new Builder();
        b_1.storeInt(src.pricePerItem, 257);
        b_1.storeStringRefTail(src.baseCid);
        b_1.storeInt(src.maxSupply, 257);
        b_1.storeInt(src.nextIndex, 257);
        b_1.storeBit(src.saleActive);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadStickerCollection$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _name = sc_0.loadStringRefTail();
    const _royaltyReceiver = sc_0.loadAddress();
    const _royaltyBps = sc_0.loadIntBig(257);
    const sc_1 = sc_0.loadRef().beginParse();
    const _pricePerItem = sc_1.loadIntBig(257);
    const _baseCid = sc_1.loadStringRefTail();
    const _maxSupply = sc_1.loadIntBig(257);
    const _nextIndex = sc_1.loadIntBig(257);
    const _saleActive = sc_1.loadBit();
    return { $$type: 'StickerCollection$Data' as const, owner: _owner, name: _name, royaltyReceiver: _royaltyReceiver, royaltyBps: _royaltyBps, pricePerItem: _pricePerItem, baseCid: _baseCid, maxSupply: _maxSupply, nextIndex: _nextIndex, saleActive: _saleActive };
}

export function loadTupleStickerCollection$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _name = source.readString();
    const _royaltyReceiver = source.readAddress();
    const _royaltyBps = source.readBigNumber();
    const _pricePerItem = source.readBigNumber();
    const _baseCid = source.readString();
    const _maxSupply = source.readBigNumber();
    const _nextIndex = source.readBigNumber();
    const _saleActive = source.readBoolean();
    return { $$type: 'StickerCollection$Data' as const, owner: _owner, name: _name, royaltyReceiver: _royaltyReceiver, royaltyBps: _royaltyBps, pricePerItem: _pricePerItem, baseCid: _baseCid, maxSupply: _maxSupply, nextIndex: _nextIndex, saleActive: _saleActive };
}

export function loadGetterTupleStickerCollection$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _name = source.readString();
    const _royaltyReceiver = source.readAddress();
    const _royaltyBps = source.readBigNumber();
    const _pricePerItem = source.readBigNumber();
    const _baseCid = source.readString();
    const _maxSupply = source.readBigNumber();
    const _nextIndex = source.readBigNumber();
    const _saleActive = source.readBoolean();
    return { $$type: 'StickerCollection$Data' as const, owner: _owner, name: _name, royaltyReceiver: _royaltyReceiver, royaltyBps: _royaltyBps, pricePerItem: _pricePerItem, baseCid: _baseCid, maxSupply: _maxSupply, nextIndex: _nextIndex, saleActive: _saleActive };
}

export function storeTupleStickerCollection$Data(source: StickerCollection$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeString(source.name);
    builder.writeAddress(source.royaltyReceiver);
    builder.writeNumber(source.royaltyBps);
    builder.writeNumber(source.pricePerItem);
    builder.writeString(source.baseCid);
    builder.writeNumber(source.maxSupply);
    builder.writeNumber(source.nextIndex);
    builder.writeBoolean(source.saleActive);
    return builder.build();
}

export function dictValueParserStickerCollection$Data(): DictionaryValue<StickerCollection$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStickerCollection$Data(src)).endCell());
        },
        parse: (src) => {
            return loadStickerCollection$Data(src.loadRef().beginParse());
        }
    }
}

 type StickerCollection_init_args = {
    $$type: 'StickerCollection_init_args';
    owner: Address;
    name: string;
    royaltyReceiver: Address;
    royaltyBps: bigint;
    pricePerItem: bigint;
    baseCid: string;
}

function initStickerCollection_init_args(src: StickerCollection_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeStringRefTail(src.name);
        b_0.storeAddress(src.royaltyReceiver);
        b_0.storeInt(src.royaltyBps, 257);
        const b_1 = new Builder();
        b_1.storeInt(src.pricePerItem, 257);
        b_1.storeStringRefTail(src.baseCid);
        b_0.storeRef(b_1.endCell());
    };
}

async function StickerCollection_init(owner: Address, name: string, royaltyReceiver: Address, royaltyBps: bigint, pricePerItem: bigint, baseCid: string) {
    const __code = Cell.fromHex('b5ee9c72410242010011e4000228ff008e88f4a413f4bcf2c80bed5320e303ed43d90114020271020d020120030501d5ba362ed44d0d200018e30fa40d401d001fa40810101d700d401d0810101d700d401d001810101d700810101d700d2003010591058105710566c198e29fa40d401d001fa40810101d700d401d0810101d700d430d0102610251024102306d15504812af8707fe2db3c6c91804000224020120060a020271070901d3a63bda89a1a400031c61f481a803a003f481020203ae01a803a1020203ae01a803a003020203ae01020203ae01a4006020b220b020ae20acd8331c53f481a803a003f481020203ae01a803a1020203ae01a861a0204c204a204820460da2aa090255f0e0ffc5b678d9230800022801d3a721da89a1a400031c61f481a803a003f481020203ae01a803a1020203ae01a803a003020203ae01020203ae01a4006020b220b020ae20acd8331c53f481a803a003f481020203ae01a803a1020203ae01a861a0204c204a204820460da2aa090255f0e0ffc5b678d923380201580b0c01d5ad0a76a268690000c7187d206a00e800fd20408080eb806a00e8408080eb806a00e800c08080eb80408080eb80690018082c882c082b882b360cc714fd206a00e800fd20408080eb806a00e8408080eb806a186808130812881208118368aa8240957c383ff16d9e3648c03a01d5ae10f6a268690000c7187d206a00e800fd20408080eb806a00e8408080eb806a00e800c08080eb80408080eb80690018082c882c082b882b360cc714fd206a00e800fd20408080eb806a00e8408080eb806a186808130812881208118368aa8240957c383ff16d9e3648c0360201480e0f01d5b665fda89a1a400031c61f481a803a003f481020203ae01a803a1020203ae01a803a003020203ae01020203ae01a4006020b220b020ae20acd8331c53f481a803a003f481020203ae01a803a1020203ae01a861a0204c204a204820460da2aa090255f0e0ffc5b678d923032020120101201d5b1537b5134348000638c3e90350074007e9020404075c035007420404075c03500740060404075c020404075c034800c041644160415c4159b06638a7e90350074007e9020404075c035007420404075c0350c340409840944090408c1b45541204abe1c1ff8b6cf1b24601100022701d5b2e0bb5134348000638c3e90350074007e9020404075c035007420404075c03500740060404075c020404075c034800c041644160415c4159b06638a7e90350074007e9020404075c035007420404075c0350c340409840944090408c1b45541204abe1c1ff8b6cf1b24601300027a01f83001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e30fa40d401d001fa40810101d700d401d0810101d700d401d001810101d700810101d700d2003010591058105710566c198e29fa40d401d001fa40810101d700d401d0810101d700d430d0102610251024102306d15504812af8707fe21503fc0a925f0ae008d70d1ff2e082218210bd9df0b9ba8e51313908d200308200925df84228c705f2f410681057104610354430c87f01ca0055805089ce06c8ce16cd14ce12810101cf0001c8810101cf0002c8ce12cd12810101cf0012810101cf0012ca00cdc9ed54e021821017a331e6bae302018210166abfacbae3025f0a16224102cc31d401d001d401d001d430d0d401d001d401d001d401d001d430d0d401d001d401d001d401d001d430d0d401d001d430d0814d215613f2f482008dd15612a60a2cbbf2f42ca70a8169b0f8416f24135f0358bef2f4820afaf080f842f828561455020ddb3c5c2c1703ee705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d072882e1035434410354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00f842f8285613a455020bdb3c5c3f2c1803f0705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d072882d1035434410354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00f842f8285612a602550209db3c5c3f2c1903f0705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d072882c1035434410354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00f842f8285611a603550207db3c5c3f2c1a03f0705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d072882b1035434410354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00f842f8285610a604550205db3c5c3f2c1b03ec705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d072882a1035434410354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00f842f8282fa6055502db3c5c3f2c1c03ec705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d07288291035434410354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00f842f8282ea6065502db3c5c3f2c1d03ec705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d07288281035434410354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00f842f8282da6075502db3c5c3f2c1e03ec705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d07288271035434410354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00f842f8282ca6085502db3c5c3f2c1f03ec705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d07288261035434410354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00f842f8282ba6095502db3c5c3f2c2002fe705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d07288251035434410354144037f6c17c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0007a60a82101dcd6500f8416f24135f0301a1203f210198c2008e3a5250706d5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb009130e210681057104610354403024002b2fa40d401d001d401d001d430d0d401d001d401d001d401d001d430d0d401d001d401d001d401d001d430d0d401d001d430d08200925df8425613c705f2f482008dd15613a60a2dbbf2f4820afaf080f82856142d030ddb3c5c2c2303ea705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d072882e1035434410354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00f8285613a42c030bdb3c5c3f2c2403ec705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d072882d1035434410354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00f8285612a6022b0309db3c5c3f2c2503ec705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d072882c1035434410354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00f8285611a6032a0307db3c5c3f2c2603ec705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d072882b1035434410354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00f8285610a604290305db3c5c3f2c2703e8705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d072882a1035434410354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00f8282fa6052803db3c5c3f2c2803e8705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d07288291035434410354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00f8282ea6062703db3c5c3f2c2903e8705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d07288281035434410354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00f8282da6072603db3c5c3f2c2a03e8705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d07288271035434410354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00f8282ca6082503db3c5c3f2c2b03ea705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d07288261035434410354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00f8282ba609103458db3c5c3f2c3e012c88c87001ca0055315034cece810101cf0001c8cecdc92d0228ff008e88f4a413f4bcf2c80bed5320e303ed43d92e3b0202712f3902012030340201583133016bb0d7bb513434800063847e903e9020404075c03500740510cc1b052384fe903e9020404075c03500740510cc01345540b8b6cf1b106032000220016bb2697b513434800063847e903e9020404075c03500740510cc1b052384fe903e9020404075c03500740510cc01345540b8b6cf1b1060360201203537016bb4a3bda89a1a400031c23f481f481020203ae01a803a0288660d8291c27f481f481020203ae01a803a028866009a2aa05c5b678d883036000223016bb74f7da89a1a400031c23f481f481020203ae01a803a0288660d8291c27f481f481020203ae01a803a028866009a2aa05c5b678d883038000221016bbfabef6a268690000c708fd207d20408080eb806a00e80a2198360a4709fd207d20408080eb806a00e80a21980268aa81716d9e3620c3a00022202e63001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e11fa40fa40810101d700d401d01443306c148e13fa40fa40810101d700d401d014433004d15502e205925f05e07024d74920c21f953104d31f05de2182104d23fb89bae30235c00004c12114b0e3025f04f2c0823c3d00565b03fa40308200925df8425004c70513f2f44003c87f01ca0055305034cece810101cf0001c8cecdc9ed5400324003c87f01ca0055305034cece810101cf0001c8cecdc9ed5402ee705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d072881025443010354144037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0007a60a10681057104610354403023f400014000000006465706c6f79006cc87f01ca0055805089ce06c8ce16cd14ce12810101cf0001c8810101cf0002c8ce12cd12810101cf0012810101cf0012ca00cdc9ed540006f2c0824e5c1d97');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initStickerCollection_init_args({ $$type: 'StickerCollection_init_args', owner, name, royaltyReceiver, royaltyBps, pricePerItem, baseCid })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const StickerCollection_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    19745: { message: "SALE_OFF" },
    27056: { message: "INSUFFICIENT_FUNDS" },
    36305: { message: "SOLD_OUT" },
    37469: { message: "ONLY_OWNER" },
} as const

export const StickerCollection_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "SALE_OFF": 19745,
    "INSUFFICIENT_FUNDS": 27056,
    "SOLD_OUT": 36305,
    "ONLY_OWNER": 37469,
} as const

const StickerCollection_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"ChangeOwner","header":2174598809,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwnerOk","header":846932810,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"Transfer","header":1294203785,"fields":[{"name":"to","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"StickerItem$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"collection","type":{"kind":"simple","type":"address","optional":false}},{"name":"index","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"uri","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"SetSaleActive","header":3181244601,"fields":[{"name":"active","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MintPack","header":396571110,"fields":[{"name":"uri0","type":{"kind":"simple","type":"string","optional":false}},{"name":"uri1","type":{"kind":"simple","type":"string","optional":false}},{"name":"uri2","type":{"kind":"simple","type":"string","optional":false}},{"name":"uri3","type":{"kind":"simple","type":"string","optional":false}},{"name":"uri4","type":{"kind":"simple","type":"string","optional":false}},{"name":"uri5","type":{"kind":"simple","type":"string","optional":false}},{"name":"uri6","type":{"kind":"simple","type":"string","optional":false}},{"name":"uri7","type":{"kind":"simple","type":"string","optional":false}},{"name":"uri8","type":{"kind":"simple","type":"string","optional":false}},{"name":"uri9","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"AirdropPack","header":376094636,"fields":[{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"uri0","type":{"kind":"simple","type":"string","optional":false}},{"name":"uri1","type":{"kind":"simple","type":"string","optional":false}},{"name":"uri2","type":{"kind":"simple","type":"string","optional":false}},{"name":"uri3","type":{"kind":"simple","type":"string","optional":false}},{"name":"uri4","type":{"kind":"simple","type":"string","optional":false}},{"name":"uri5","type":{"kind":"simple","type":"string","optional":false}},{"name":"uri6","type":{"kind":"simple","type":"string","optional":false}},{"name":"uri7","type":{"kind":"simple","type":"string","optional":false}},{"name":"uri8","type":{"kind":"simple","type":"string","optional":false}},{"name":"uri9","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"StickerCollection$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"name","type":{"kind":"simple","type":"string","optional":false}},{"name":"royaltyReceiver","type":{"kind":"simple","type":"address","optional":false}},{"name":"royaltyBps","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"pricePerItem","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"baseCid","type":{"kind":"simple","type":"string","optional":false}},{"name":"maxSupply","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"nextIndex","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"saleActive","type":{"kind":"simple","type":"bool","optional":false}}]},
]

const StickerCollection_opcodes = {
    "ChangeOwner": 2174598809,
    "ChangeOwnerOk": 846932810,
    "Transfer": 1294203785,
    "SetSaleActive": 3181244601,
    "MintPack": 396571110,
    "AirdropPack": 376094636,
}

const StickerCollection_getters: ABIGetter[] = [
    {"name":"get_name","methodId":107853,"arguments":[],"returnType":{"kind":"simple","type":"string","optional":false}},
    {"name":"get_sale_active","methodId":103215,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"get_next_index","methodId":83856,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_pack_size","methodId":113538,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_price_per_item","methodId":74594,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_base_cid","methodId":97313,"arguments":[],"returnType":{"kind":"simple","type":"string","optional":false}},
    {"name":"get_max_supply","methodId":94740,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"owner","methodId":83229,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

export const StickerCollection_getterMapping: { [key: string]: string } = {
    'get_name': 'getGetName',
    'get_sale_active': 'getGetSaleActive',
    'get_next_index': 'getGetNextIndex',
    'get_pack_size': 'getGetPackSize',
    'get_price_per_item': 'getGetPricePerItem',
    'get_base_cid': 'getGetBaseCid',
    'get_max_supply': 'getGetMaxSupply',
    'owner': 'getOwner',
}

const StickerCollection_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"SetSaleActive"}},
    {"receiver":"internal","message":{"kind":"typed","type":"MintPack"}},
    {"receiver":"internal","message":{"kind":"typed","type":"AirdropPack"}},
]

export const PACK_SIZE = 10n;

export class StickerCollection implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = StickerCollection_errors_backward;
    public static readonly opcodes = StickerCollection_opcodes;
    
    static async init(owner: Address, name: string, royaltyReceiver: Address, royaltyBps: bigint, pricePerItem: bigint, baseCid: string) {
        return await StickerCollection_init(owner, name, royaltyReceiver, royaltyBps, pricePerItem, baseCid);
    }
    
    static async fromInit(owner: Address, name: string, royaltyReceiver: Address, royaltyBps: bigint, pricePerItem: bigint, baseCid: string) {
        const __gen_init = await StickerCollection_init(owner, name, royaltyReceiver, royaltyBps, pricePerItem, baseCid);
        const address = contractAddress(0, __gen_init);
        return new StickerCollection(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new StickerCollection(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  StickerCollection_types,
        getters: StickerCollection_getters,
        receivers: StickerCollection_receivers,
        errors: StickerCollection_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: SetSaleActive | MintPack | AirdropPack) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetSaleActive') {
            body = beginCell().store(storeSetSaleActive(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'MintPack') {
            body = beginCell().store(storeMintPack(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'AirdropPack') {
            body = beginCell().store(storeAirdropPack(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetName(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_name', builder.build())).stack;
        const result = source.readString();
        return result;
    }
    
    async getGetSaleActive(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_sale_active', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getGetNextIndex(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_next_index', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetPackSize(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_pack_size', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetPricePerItem(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_price_per_item', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetBaseCid(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_base_cid', builder.build())).stack;
        const result = source.readString();
        return result;
    }
    
    async getGetMaxSupply(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_max_supply', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('owner', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
}