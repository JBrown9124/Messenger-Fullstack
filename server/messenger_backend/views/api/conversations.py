from django.contrib.auth.middleware import get_user
from django.db.models import Max, Q
from django.db.models.query import Prefetch
from django.http import HttpResponse, JsonResponse
from messenger_backend.models import Conversation, Message, User
from online_users import online_users
from rest_framework.views import APIView
from rest_framework.request import Request
from django.utils import timezone


class Conversations(APIView):
    """get all conversations for a user, include latest message text for preview, and all messages
    include other user model so we have info on username/profile pic (don't include current user info)
    TODO: for scalability, implement lazy loading"""

    def get(self, request: Request):
        try:
            user = get_user(request)

            if user.is_anonymous:
                return HttpResponse(status=401)
            user_id = user.id

            conversations = (
                Conversation.objects.filter(Q(user1=user_id) | Q(user2=user_id))
                .prefetch_related(
                    Prefetch(
                        "messages",
                        queryset=Message.objects.only("createdAt").order_by(
                            "createdAt"
                        ),
                    )
                )
                .all()
            )

            conversations_response = []

            for convo in conversations:
                # A error occurs when there are no messages sent by the user (when there isn't anything to return from .filter()).
                try:
                    lastMessageRead = (
                        convo.messages.only("id")
                        .filter(senderId=user_id)
                        .latest("readAt")
                        .to_dict(["id"])
                    )
                except:
                    lastMessageRead = {"id": None}
                other_user_id = convo.user2.id
                convo_dict = {
                    "id": convo.id,
                    "unreadCount": convo.messages.only("readAt", "senderId")
                    .exclude(senderId=user_id)
                    .filter(readAt=None)
                    .count(),
                    "lastMessageRead": lastMessageRead,
                    "messages": [
                        message.to_dict(
                            ["id", "text", "senderId", "createdAt", "readAt"]
                        )
                        for message in convo.messages.all()
                    ],
                }

                # set properties for notification count and latest message preview
                convo_dict["latestMessageText"] = convo_dict["messages"][-1]["text"]

                # set a property "otherUser" so that frontend will have easier access
                user_fields = ["id", "username", "photoUrl"]
                if convo.user1 and convo.user1.id != user_id:
                    convo_dict["otherUser"] = convo.user1.to_dict(user_fields)
                elif convo.user2 and convo.user2.id != user_id:
                    convo_dict["otherUser"] = convo.user2.to_dict(user_fields)

                # set property for online status of the other user
                if convo_dict["otherUser"]["id"] in online_users:
                    convo_dict["otherUser"]["online"] = True
                else:
                    convo_dict["otherUser"]["online"] = False

                conversations_response.append(convo_dict)
            conversations_response.sort(
                key=lambda convo: convo["messages"][-1]["createdAt"],
                reverse=True,
            )
            return JsonResponse(
                conversations_response,
                safe=False,
            )
        except Exception as e:
            return HttpResponse(status=500)

    def put(self, request: Request):
        """Expects {conversationId, messageId } in body (messageId will be null if we are changing more than one message in a conversation).
        Returns conversationId and messages or message ID and new readAt times"""
        try:
            user = get_user(request)
            user_id = user.id
            if user.is_anonymous:
                return HttpResponse(status=401)

            body = request.data
            other_user_id = body.get("otherUserId")
            conversationId = body.get("conversationId")
            messageId = body.get("messageId")

            # If we know the message ID do a simple look up of the message and update the readAt.
            if messageId:
                message = Message.objects.get(id=messageId)
                message_conversation_id = message.conversation_id

                if message_conversation_id != conversationId:
                    return HttpResponse(status=500)
                message_sender_id = message.senderId
                if other_user_id != message_sender_id:
                    return HttpResponse(status=500)

                message.readAt = timezone.now()
                message.save()
                newly_read_message = [message.to_dict(["id", "senderId", "readAt"])]
                return JsonResponse(
                    {"conversationId": conversationId, "messages": newly_read_message}
                )

            conversation = Conversation.objects.get(id=conversationId)

            conversation_user1_id = conversation.user1.id
            conversation_user2_id = conversation.user2.id
            if user_id != conversation_user1_id and user_id != conversation_user2_id:
                return HttpResponse(status=403)
            if (
                other_user_id != conversation_user1_id
                and other_user_id != conversation_user2_id
            ):
                return HttpResponse(status=403)

            unread_messages_received = conversation.messages.exclude(
                senderId=user_id
            ).filter(readAt=None)

            newly_read_messages_response = []

            for unread_message in unread_messages_received:
                unread_message.readAt = timezone.now()
                unread_message.save()
                newly_read_messages_response.append(
                    unread_message.to_dict(["id", "senderId", "readAt"])
                )

            return JsonResponse(
                {
                    "conversationId": conversationId,
                    "messages": newly_read_messages_response,
                }
            )
        except Exception as e:
            return HttpResponse(status=500)
