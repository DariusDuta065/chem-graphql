// package: chembuff
// file: chembuff.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as chembuff_pb from "./chembuff_pb";

interface IDiscordBotService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    sendMessage: IDiscordBotService_ISendMessage;
}

interface IDiscordBotService_ISendMessage extends grpc.MethodDefinition<chembuff_pb.MessageRequest, chembuff_pb.MessageReply> {
    path: "/chembuff.DiscordBot/SendMessage";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<chembuff_pb.MessageRequest>;
    requestDeserialize: grpc.deserialize<chembuff_pb.MessageRequest>;
    responseSerialize: grpc.serialize<chembuff_pb.MessageReply>;
    responseDeserialize: grpc.deserialize<chembuff_pb.MessageReply>;
}

export const DiscordBotService: IDiscordBotService;

export interface IDiscordBotServer extends grpc.UntypedServiceImplementation {
    sendMessage: grpc.handleUnaryCall<chembuff_pb.MessageRequest, chembuff_pb.MessageReply>;
}

export interface IDiscordBotClient {
    sendMessage(request: chembuff_pb.MessageRequest, callback: (error: grpc.ServiceError | null, response: chembuff_pb.MessageReply) => void): grpc.ClientUnaryCall;
    sendMessage(request: chembuff_pb.MessageRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: chembuff_pb.MessageReply) => void): grpc.ClientUnaryCall;
    sendMessage(request: chembuff_pb.MessageRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: chembuff_pb.MessageReply) => void): grpc.ClientUnaryCall;
}

export class DiscordBotClient extends grpc.Client implements IDiscordBotClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public sendMessage(request: chembuff_pb.MessageRequest, callback: (error: grpc.ServiceError | null, response: chembuff_pb.MessageReply) => void): grpc.ClientUnaryCall;
    public sendMessage(request: chembuff_pb.MessageRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: chembuff_pb.MessageReply) => void): grpc.ClientUnaryCall;
    public sendMessage(request: chembuff_pb.MessageRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: chembuff_pb.MessageReply) => void): grpc.ClientUnaryCall;
}
