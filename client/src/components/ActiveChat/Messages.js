import React from "react";
import { Box } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import moment from "moment";

const Messages = (props) => {
  const { messages, otherUser, userId } = props;

  const getLastReceivedMessageId = () => {
    const receivedReadMessages = messages.filter((message) => {
      return userId === message.senderId && message.readAt !== null;
    });
    if (receivedReadMessages.length > 0) {
      return receivedReadMessages.at(-1).id;
    }
    return "None Found";
  };

  return (
    <Box>
      {messages.map((message) => {
        const isLastMessageRead = getLastReceivedMessageId() === message.id;
        const time = moment(message.createdAt).format("h:mm");
        return message.senderId === userId ? (
          <SenderBubble
            key={message.id}
            otherUser={otherUser}
            isRead={isLastMessageRead}
            text={message.text}
            time={time}
          />
        ) : (
          <OtherUserBubble
            key={message.id}
            text={message.text}
            time={time}
            otherUser={otherUser}
          />
        );
      })}
    </Box>
  );
};

export default Messages;
