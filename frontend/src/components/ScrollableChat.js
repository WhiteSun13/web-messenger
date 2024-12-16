import { Avatar, Tooltip, useColorMode, useColorModeValue } from "@chakra-ui/react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

function ScrollableChat({ messages }) {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex", flexDirection: "column" }} key={m._id}>
            <div style={{ display: "flex" }}>
              {(isSameSender(messages, m, i, user._id) ||
                isLastMessage(messages, i, user._id)) && (
                <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                  <Avatar
                    mt="7px"
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}
              {m.content ? (
              <span
                style={{
                  backgroundColor: `${
                    m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                  }`,
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  borderRadius: "20px",
                  padding: "5px 15px",
                  maxWidth: "75%",
                  color: "black",
                }}
              >
                {m.content}
              </span> ) : null}
            </div>
            {console.log(m.image)}
            {m.image && (
              <img
                src={m.image}
                alt="Attached"
                style={{
                  maxWidth: "45%",
                  maxHeight: "300px",
                  borderRadius: "10px",
                  marginTop: "5px",
                  alignSelf: m.sender._id === user._id ? "flex-end" : "flex-start",
                }}
              />
            )}
          </div>
        ))}
    </ScrollableFeed>
  );
}

export default ScrollableChat;
