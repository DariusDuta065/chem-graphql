// package: chembuff
// file: chembuff.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class MessageRequest extends jspb.Message { 
    getChannel(): string;
    setChannel(value: string): MessageRequest;
    getMessage(): string;
    setMessage(value: string): MessageRequest;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MessageRequest.AsObject;
    static toObject(includeInstance: boolean, msg: MessageRequest): MessageRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MessageRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MessageRequest;
    static deserializeBinaryFromReader(message: MessageRequest, reader: jspb.BinaryReader): MessageRequest;
}

export namespace MessageRequest {
    export type AsObject = {
        channel: string,
        message: string,
    }
}

export class MessageReply extends jspb.Message { 
    getMessage(): string;
    setMessage(value: string): MessageReply;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MessageReply.AsObject;
    static toObject(includeInstance: boolean, msg: MessageReply): MessageReply.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MessageReply, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MessageReply;
    static deserializeBinaryFromReader(message: MessageReply, reader: jspb.BinaryReader): MessageReply;
}

export namespace MessageReply {
    export type AsObject = {
        message: string,
    }
}
