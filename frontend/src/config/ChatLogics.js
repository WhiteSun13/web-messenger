export const getSender = (user) => {
  const loggedUser = JSON.parse(localStorage.getItem("userInfo"))
  return user[0]._id === loggedUser._id ? user[1].name : user[0].name;
};

export const getSenderFull = (user) => {
  const loggedUser = JSON.parse(localStorage.getItem("userInfo"))
  return user[0]._id === loggedUser._id ? user[1] : user[0];
};

export const isSameSender = (messages, m, i, userId) => {
  return (
    i > 0 &&
    (messages[i - 1].sender._id !== m.sender._id ||
      messages[i - 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

export const isFirstMessage = (messages, i, userId) => {
  return ( 
    i === 0 &&
    messages[0].sender._id !== userId &&
    messages[0].sender._id
  );
};

export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};

export const isSameSenderMargin = (messages, m, i, userId) => {
  if (
    i > 0 &&
    messages[i - 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33;
  else if (
    (i > 0 &&
      messages[i - 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === 0 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};
