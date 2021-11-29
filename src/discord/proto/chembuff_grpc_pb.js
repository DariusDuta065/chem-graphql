// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var chembuff_pb = require('./chembuff_pb.js');

function serialize_chembuff_MessageReply(arg) {
  if (!(arg instanceof chembuff_pb.MessageReply)) {
    throw new Error('Expected argument of type chembuff.MessageReply');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_chembuff_MessageReply(buffer_arg) {
  return chembuff_pb.MessageReply.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_chembuff_MessageRequest(arg) {
  if (!(arg instanceof chembuff_pb.MessageRequest)) {
    throw new Error('Expected argument of type chembuff.MessageRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_chembuff_MessageRequest(buffer_arg) {
  return chembuff_pb.MessageRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var DiscordBotService = exports.DiscordBotService = {
  sendMessage: {
    path: '/chembuff.DiscordBot/SendMessage',
    requestStream: false,
    responseStream: false,
    requestType: chembuff_pb.MessageRequest,
    responseType: chembuff_pb.MessageReply,
    requestSerialize: serialize_chembuff_MessageRequest,
    requestDeserialize: deserialize_chembuff_MessageRequest,
    responseSerialize: serialize_chembuff_MessageReply,
    responseDeserialize: deserialize_chembuff_MessageReply,
  },
};

exports.DiscordBotClient = grpc.makeGenericClientConstructor(DiscordBotService);
