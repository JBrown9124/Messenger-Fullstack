import React from "react";
import { Box } from "@material-ui/core";
import { BadgeAvatar, ChatContent, BadgeUnreadMessages } from "../Sidebar";
import { makeStyles } from "@material-ui/core/styles";
import { setActiveChat } from "../../store/activeConversation";
import { connect } from "react-redux";
import { updateReadConvo } from "../../store/utils/thunkCreators";
const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: "0 2px 10px 0 rgba(88,133,196,0.05)",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    "&:hover": {
      cursor: "grab",
    },
  },
}));

const Chat = (props) => {
  const classes = useStyles();
  const { conversation } = props;
  const { otherUser } = conversation;

  const handleClick = async (conversation) => {
    if (conversation.unreadCount > 0) {
      const reqBody = {conversationId: conversation.id, messageId: null, otherUserId:otherUser.id}
      await props.updateReadConvo(reqBody);
    }
    await props.setActiveChat(otherUser.id);
    };

  return (
    <Box onClick={() => handleClick(conversation)} className={classes.root}>
      <BadgeAvatar
        photoUrl={otherUser.photoUrl}
        username={otherUser.username}
        online={otherUser.online}
        sidebar={true}
      />
      <ChatContent isUnread={conversation.unreadCount > 0} conversation={conversation} />
      <BadgeUnreadMessages unreadCount={conversation.unreadCount} />
    </Box>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateReadConvo: (id) => {
      dispatch(updateReadConvo(id));
    },
    setActiveChat: (conversation) => {
      dispatch(setActiveChat(conversation));
    },
  };
};

export default connect(null, mapDispatchToProps)(Chat);
