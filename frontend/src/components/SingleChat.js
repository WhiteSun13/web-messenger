import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text, Image } from "@chakra-ui/react";
import { IconButton, Spinner, useToast, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon, AttachmentIcon, EmailIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import { ChatState } from "../Context/ChatProvider";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import "./styles.css";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

function SingleChat({ fetchAgain, setFetchAgain }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const { colorMode } = useColorMode();
  const txtColorModeValue = useColorModeValue("black", "white");

  const toast = useToast();

  const { selectedChat, setSelectedChat, user, notification, setNotification } = ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);

      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Ошибка!",
        description: "Не удалось загрузить сообщения.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setSelectedFilePreview(URL.createObjectURL(file));
    }
  };

  const sendMessageEnter = async (e) => {
    if (e.key === "Enter") {sendMessage();};
  }

  const sendMessage = async (e) => {
    if (newMessage || selectedFile) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        let imageUrl;
        if (selectedFile) {
          setUploadingImage(true);
          const formData = new FormData();
          formData.append("file", selectedFile);
          formData.append("upload_preset", "chat-app");
          formData.append("cloud_name", process.env.REACT_APP_CLOUD_NAME);

          const { data } = await axios.post(
            `https://api.cloudinary.com/v1_1/dkrhez4sn/image/upload`,
            formData
          );
          imageUrl = data.url;
          setUploadingImage(false);
        }

        const messageData = {
          content: newMessage,
          chatId: selectedChat._id,
          image: imageUrl || undefined,
        };

        setNewMessage("");
        setSelectedFile(null);
        setSelectedFilePreview(null);

        const { data } = await axios.post("/api/message", messageData, config);

        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Ошибка!",
          description: "Не удалось отправить сообщение.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    const processedNotifications = new Set(); // Набор для отслеживания отправленных уведомлений
  
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        // Проверяем, было ли уже отправлено уведомление для этого сообщения
        if (
          !notification.includes(newMessageReceived) &&
          !processedNotifications.has(newMessageReceived._id)
        ) {
          setNotification([newMessageReceived, ...notification]);
          processedNotifications.add(newMessageReceived._id); // Добавляем ID сообщения в набор
          setFetchAgain(!fetchAgain);
  
          if (Notification.permission === "granted") {
            new Notification(newMessageReceived.chat.users[0].name, {
              body: newMessageReceived.content,
            });
          }
        }
      } else {
        setMessages([...messages, newMessageReceived]);
      }
    });
  }, [selectedChat, messages, notification, fetchAgain]);
  

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;

    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Noto sans"
            d="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
            color="white"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
              color={txtColorModeValue}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(selectedChat.users)}
                <ProfileModal user={getSenderFull(selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  fetchMessages={fetchMessages}
                />
              </>
            )}
          </Text>

          <Box
            d="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            variant="filled"
            bg={colorMode === "light" ? "white" : "#2d3748"}
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner size="xl" w={20} h={20} alignSelf="center" margin="auto" />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            {selectedFilePreview && (
              <Box mb={3}>
                <Image
                  src={selectedFilePreview}
                  alt="Превью изображения"
                  maxW="100%"
                  maxH="200px"
                  borderRadius="md"
                />
              </Box>
            )}

            {istyping && (
              <Box mb={3}>
                <Lottie
                  options={{
                    loop: true,
                    autoplay: true,
                    animationData: animationData,
                    rendererSettings: {
                      preserveAspectRatio: "xMidYMid slice",
                    },
                  }}
                  width={70}
                  style={{ marginBottom: 15, marginLeft: 0 }}
                />
              </Box>
            )}

            <FormControl onKeyDown={sendMessageEnter} isRequired mt={3} d="flex" alignItems="center">
              <Input
                variant="filled"
                placeholder="Введите сообщение..."
                value={newMessage}
                onChange={typingHandler}
                flex="1"
              />
              <IconButton
                as="label"
                htmlFor="file-input"
                icon={<AttachmentIcon />}
                colorScheme="teal"
                variant="ghost"
                isDisabled={uploadingImage}
                ml={2}
              />
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                isDisabled={uploadingImage}
                display="none"
                id="file-input"
              />
              {/* Кнопка отправки сообщения */}
              <IconButton
                icon={<EmailIcon />}
                colorScheme="blue"
                onClick={sendMessage}
                ml={2}
                isDisabled={uploadingImage || !newMessage.trim() && !selectedFile}
              />
            </FormControl>
          </Box>
        </>
      ) : null}
    </>
  );
}

export default SingleChat;
