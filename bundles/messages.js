import { fetchMessages } from '../common/lib/api';
const FETCH_MESSAGES_STARTED = 'messages/FETCH_MESSAGES_STARTED';
const FETCH_MESSAGES_FINISHED = 'messages/FETCH_MESSAGES_FINISHED';
const MESSAGES_ERROR = 'messages/MESSAGES_ERROR';
const UPDATE_MESSAGES = 'messages/UPDATE_MESSAGES';
const UPDATE_MESSAGE_VOTE_COUNT = 'messages/UPDATE_MESSAGE_VOTE_COUNT';

const doError = (error) => ({ type: MESSAGES_ERROR, payload: error });

export default {
  name: 'messages',
  getReducer: () => {
    const initialData = {
      data: {},
      lastUpdated: null,
      loading: false,
      hasMoreMessages: null,
      error: null,
    };

    return (state = initialData, { type, payload }) => {
      if (type === FETCH_MESSAGES_STARTED) {
        return {
          ...state,
          loading: true,
        };
      }
      if (type === FETCH_MESSAGES_FINISHED) {
        return {
          ...state,
          loading: false,
          lastUpdated: Date.now(),
          data: payload.messages,
          hasMoreMessages: payload.hasMoreMessages,
        };
      }
      if (type === UPDATE_MESSAGES) {
        return {
          ...state,
          data: {
            ...state.data,
            [payload._id]: payload,
          },
          lastUpdated: Date.now(),
        };
      }
      if (type === UPDATE_MESSAGE_VOTE_COUNT) {
        return {
          ...state,
          data: {
            ...state.data,
            [payload._id]: payload,
          },
          lastUpdated: Date.now(),
        };
      }
      if (type === MESSAGES_ERROR) {
        return {
          ...state,
          error: payload,
          loading: false,
        };
      }
      return state;
    };
  },
  doAddMessage: (message) => ({ getState, dispatch, store }) => {
    const messages = store.selectMessages(getState());

    if (messages.find((m) => m._id === message._id)) {
      return null;
    }
    dispatch({
      type: UPDATE_MESSAGES,
      payload: message.attrs,
    });
  },
  doUpdateMessageVoteCount: (vote) => ({ dispatch, getState, store }) => {
    const message = store.selectMessagesRaw(getState())[vote.attrs.messageId];
    if (message && message.votes.find((v) => v._id === vote._id)) return null;
    dispatch({
      type: UPDATE_MESSAGE_VOTE_COUNT,
      payload: {
        ...message,
        votes: [...new Set([vote, ...message.votes])],
      },
    });
  },
  doFetchMessages: (query) => async ({ dispatch }) => {
    try {
      dispatch({
        type: FETCH_MESSAGES_STARTED,
      });
      const rawMessages = await fetchMessages(query);

      const payload = {
        messages: rawMessages.reduce((result, item) => {
          result[item._id] = item;
          return result;
        }, {}),
        hasMoreMessages: rawMessages.length === 10,
      };

      dispatch({
        type: FETCH_MESSAGES_FINISHED,
        payload,
      });

      return payload;
    } catch (error) {
      dispatch(doError(error));
    }
  },
  doFetchMoreMessages: (createdBy) => async ({ getState, dispatch, store }) => {
    const messages = store.selectMessages(getState());
    const loading = getState().messages.loading;
    const hasMoreMessages = getState().messages.hasMoreMessages;
    if (!hasMoreMessages || loading) return;
    try {
      dispatch({
        type: FETCH_MESSAGES_STARTED,
      });
      const lastMessage = messages && messages.length && messages[messages.length - 1];

      const newMessagesAttrs = await fetchMessages({
        lt: lastMessage && lastMessage.createdAt,
        createdBy,
      });
      const mergedMessages = messages && messages.concat(newMessagesAttrs);
      const _hasMoreMessages = newMessagesAttrs.length === 10;
      const payload = {
        messages: mergedMessages.reduce((result, item) => {
          result[item._id] = item;
          return result;
        }, {}),
        hasMoreMessages: _hasMoreMessages,
      };
      dispatch({
        type: FETCH_MESSAGES_FINISHED,
        payload,
      });

      return payload;
    } catch (e) {
      dispatch(doError(e));
    }
  },
  selectMessagesRaw: (state) => state.messages.data,
  selectMessages: (state) =>
    Object.values(state.messages.data).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
};