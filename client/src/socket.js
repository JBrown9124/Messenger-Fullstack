import io from "socket.io-client";
import store from "./store";
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser,
  addUnreadCount,
} from "./store/conversations";
import { updateReadConvo } from "./store/utils/thunkCreators";

const socket = io(window.location.origin);

socket.on("connect", () => {
  console.log("connected to server");

  socket.on("add-online-user", (id) => {
    store.dispatch(addOnlineUser(id));
  });

  socket.on("remove-offline-user", (id) => {
    store.dispatch(removeOfflineUser(id));
  });
  socket.on("new-message", (data) => {
    const myStore = store.getState();
    const { message, sender } = data;
    store.dispatch(setNewMessage(message, sender));
    /* Active conversation is now username ID as opposed to the username itself. 
    If the activeConversation is equal to the message being received' sender ID, then
    we use updateReadConvo to set the message to read. Otherwise this means the conversation
    is not currently active. Therefore we add one to the unread count.
    */
    if (myStore.activeConversation === message.senderId) {
      const reqBody = {conversationId: message.conversationId, messageId:message.id}
      store.dispatch(updateReadConvo(reqBody));
    } else {
      store.dispatch(addUnreadCount(message.conversationId));
    }
  });
});

export default socket;
