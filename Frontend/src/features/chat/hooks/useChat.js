import { useState, useEffect, useRef } from 'react';
import { getSocket, onSocketReady } from '../../../lib/socket.js';
import { getCourseMessagesApi, getDirectMessagesApi } from '../api/chatApi.js';

export const useCourseChat = (course_id) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!course_id) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const res = await getCourseMessagesApi(course_id);
        setMessages(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    loadMessages();

    onSocketReady((socket) => {
      socket.emit('join_course', parseInt(course_id));

      const handleNewMessage = (message) => {
        setMessages((prev) => [...prev, message]);
      };

      const handleDeletedMessage = (messageId) => {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      };

      const handleChatCleared = () => {
        setMessages([]);
      };

      socket.off('new_course_message');
      socket.off('message_deleted');
      socket.off('chat_cleared');

      socket.on('new_course_message', handleNewMessage);
      socket.on('message_deleted', handleDeletedMessage);
      socket.on('chat_cleared', handleChatCleared);
    });

    return () => {
      const socket = getSocket();
      socket?.emit('leave_course', parseInt(course_id));
      socket?.off('new_course_message');
      socket?.off('message_deleted');
      socket?.off('chat_cleared');
    };
  }, [course_id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (content) => {
    const socket = getSocket();
    socket?.emit('send_course_message', { course_id: parseInt(course_id), content });
  };

  return { messages, setMessages, loading, sendMessage, bottomRef };
};

export const useDirectChat = (other_user_id) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!other_user_id) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const res = await getDirectMessagesApi(other_user_id);
        setMessages(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    loadMessages();

    onSocketReady((socket) => {
      socket.emit('join_direct', parseInt(other_user_id));

      const handleNewMessage = (message) => {
        setMessages((prev) => [...prev, message]);
      };

      const handleDeletedMessage = (messageId) => {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      };

      socket.off('new_direct_message');
      socket.off('message_deleted');

      socket.on('new_direct_message', handleNewMessage);
      socket.on('message_deleted', handleDeletedMessage);
    });

    return () => {
      const socket = getSocket();
      socket?.off('new_direct_message');
      socket?.off('message_deleted');
    };
  }, [other_user_id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (content) => {
    const socket = getSocket();
    socket?.emit('send_direct_message', { receiver_id: parseInt(other_user_id), content });
  };

  return { messages, setMessages, loading, sendMessage, bottomRef };
};