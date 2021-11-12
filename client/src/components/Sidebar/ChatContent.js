import React from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: 20,
    flexGrow: 1,
  },
  previewText: (isUnread) => ({
    fontSize: 12,
    color: isUnread ? "black" : "#9CADC8",
    fontWeight: isUnread ? 600 : 200,
    letterSpacing: -0.17,
  }),
  username: {
    fontWeight: "bold",
    letterSpacing: -0.2,
  },
}));

const ChatContent = (props) => {
  const { conversation, isUnread } = props;
  const { latestMessageText, otherUser } = conversation;
  const classes = useStyles(isUnread);

  return (
    <Box className={classes.root}>
      <Box>
        <Typography className={classes.username}>
          {otherUser.username}
        </Typography>
        <Typography className={classes.previewText}>
          {latestMessageText}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatContent;
