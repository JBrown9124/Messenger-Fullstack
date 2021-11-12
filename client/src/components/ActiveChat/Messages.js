import React from "react";
import { Box } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import moment from "moment";

const Messages = (props) => {
  const { messages, otherUser, userId, lastMessageRead } = props;

  return (
    <Box>
      {messages.map((message) => {
        const isLastMessageRead = lastMessageRead.id === message.id;

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
