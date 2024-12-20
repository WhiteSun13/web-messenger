import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { Image } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import ChatLoading from "./ChatLoading";
import { Button, useColorMode, useColorModeValue, } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderFull } from "../config/ChatLogics";
import GroupChatModal from "./miscellaneous/GroupChatModal";

function MyChats({ fetchAgain }) {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  const bgColor = useColorModeValue("white", "#2d3748");
  const txtColor = useColorModeValue("black", "white");

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      console.log(data);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="#ffffff00"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="0px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Noto sans"
        d="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
        color="#ffffff"
      >
        Чат
        <GroupChatModal>
          <Button
            d="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
            color={useColorModeValue("black", "white")}
            bg={useColorModeValue("white", "#2d3748")}
          >
            Новая группа
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        d="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F800"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats && chats.length > 0 ? (
  <Stack overflowY="scroll">
    {chats.map((chat) => (
      <Box
        onClick={() => setSelectedChat(chat)}
        d="flex"
        cursor="pointer"
        bg={selectedChat === chat ? "#1ca9c9" : bgColor}
        color={selectedChat === chat ? "white" : txtColor}
        px={3}
        py={2}
        borderRadius="lg"
        key={chat._id}
      >
        {/* Проверка на наличие sender и изображения */}
        {chat.users && chat.users.length > 0 && (
          <Image
            borderRadius="full"
            boxSize="50px"
            src={!chat.isGroupChat
              ? getSenderFull(chat.users).pic
              : chat.latestMessage.sender.pic}
            alt={!chat.isGroupChat
              ? getSender(chat.users)
              : chat.chatName}
          />
        )}
        <Box ml={2}>
          <Text>
            {!chat.isGroupChat
              ? getSender(chat.users)
              : chat.chatName}
          </Text>
          {chat.latestMessage && (
            <Text fontSize="xs">
              <b>{chat.latestMessage.sender.name} : </b>
              {chat.latestMessage.content.length > 50
                ? chat.latestMessage.content.substring(0, 51) + "..."
                : chat.latestMessage.content}
            </Text>
          )}
        </Box>
      </Box>
    ))}
  </Stack>
) : (
  <ChatLoading />
)}

      </Box>
    </Box>
  );
}

export default MyChats;
