import React, { useEffect, useState, useContext } from 'react';
import { Flex, Box, Type } from 'blockstack-ui';
import NProgress from 'nprogress';
import { getConfig } from 'radiks';

import { AppContext } from '../common/context/app-context';
import dynamic from 'next/dynamic';
import Message from '../models/Message';
import MessageComponent from './message';
import { Button } from './button';
import { Login } from './login';

const Compose = dynamic(() => import('./compose'), {
  loading: () => (
    <Box p="16px">
      <Box border="1px solid hsl(204,25%,80%)" height="44px" p="12px">
        <Type color="#aaaaaa">Loading...</Type>
      </Box>
    </Box>
  ),
  ssr: false,
});

const login = () => {
  const scopes = ['store_write', 'publish_data'];
  const redirect = window.location.origin;
  const manifest = `${window.location.origin}/manifest.json`;
  const { userSession } = getConfig();
  userSession.redirectToSignIn(redirect, manifest, scopes);
};

const fetchMoreMessages = async (messages) => {
  const lastMessage = messages && messages.length && messages[messages.length - 1];
  const newMessages = await Message.fetchList(
    {
      createdAt: {
        $lt: lastMessage && lastMessage.attrs.createdAt,
      },
      limit: 10,
      sort: '-createdAt',
    },
    { decrypt: false }
  );
  const newmessages = messages && messages.concat(newMessages);
  const hasMoreMessages = newMessages.length !== 0;
  return {
    hasMoreMessages,
    messages: newmessages,
  };
};

const TopArea = (props) => {
  const { isLoggedIn } = useContext(AppContext);

  return !isLoggedIn ? <Login px={4} handleLogin={login} /> : <Compose />;
};

const Messages = ({ messages }) => messages.map((message) => <MessageComponent key={message._id} message={message} />);

const Feed = ({ messages, rawMessages, ...rest }) => {
  const [liveMessages, setLiveMessages] = useState(rawMessages.map((m) => new Message(m.attrs)));
  const [loading, setLoading] = useState(false);
  const [viewingAll, setViewingAll] = useState(false);

  const newMessageListener = (message) => {
    if (liveMessages.find((m) => m._id === message._id)) {
      return null;
    }
    setLiveMessages([...new Set([message, ...liveMessages])]);
  };

  const subscribe = () => Message.addStreamListener(newMessageListener);
  const unsubscribe = () => Message.removeStreamListener(newMessageListener);

  useEffect(() => {
    subscribe();
    return unsubscribe;
  });

  const loadMoreMessages = () => {
    NProgress.start();
    setLoading(true);
    fetchMoreMessages(liveMessages).then(({ hasMoreMessages, messages }) => {
      if (hasMoreMessages) {
        setLiveMessages(messages);
        setLoading(false);
        NProgress.done();
      } else {
        NProgress.done();
        setLoading(false);
        setViewingAll(true);
      }
    });
  };

  return (
    <Box
      border="1px solid rgb(230, 236, 240)"
      my={[2, 4]}
      mx={[2, 'auto']}
      maxWidth={600}
      bg="white"
      borderRadius={2}
      boxShadow="card"
      {...rest}
    >
      <TopArea />
      <Messages messages={liveMessages} />
      <Flex borderTop="1px solid rgb(230, 236, 240)" alignItems="center" justifyContent="center" p={4}>
        {viewingAll ? (
          <Type color="purple" fontWeight="bold">
            You've reached the end of the line!
          </Type>
        ) : (
          <Button onClick={!loading && loadMoreMessages}>{loading ? 'Loading...' : 'Load more'}</Button>
        )}
      </Flex>
    </Box>
  );
};

export default Feed;
