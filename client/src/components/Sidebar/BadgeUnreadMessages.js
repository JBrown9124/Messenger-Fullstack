import React from "react";
import { Box, Badge } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  badge: {
    height: 30,
    width: 30,
    borderRadius: "50%",
    border: "2px solid white",
    color: "white",
    backgroundColor: "#3A8DFF",
  },
}));

const UnreadMessages = (props) => {
  const classes = useStyles();
  const { unreadCount } = props;

  return (
    <Box>
      <Badge
        classes={{ badge: `${classes.badge}` }}
        badgeContent={unreadCount}
      ></Badge>
    </Box>
  );
};

export default UnreadMessages;
