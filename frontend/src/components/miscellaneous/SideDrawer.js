import { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Tooltip,
  Text,
  Menu,
  MenuButton,
  Avatar,
  MenuList,
  MenuItem,
  MenuDivider,
  Drawer,
  useDisclosure,
  useToast,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Input,
  Spinner,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { BellIcon, SunIcon, MoonIcon} from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import ProfileUpdateModal from "./ProfileUpdateModal";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserComponent/UserListItem";
import { getSender } from "../../config/ChatLogics";
import NotificationBadge, { Effect } from "react-notification-badge";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();

  const { colorMode, toggleColorMode } = useColorMode(); // Используем состояние и функцию переключения темы
  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const history = useHistory();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Поиск",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post("/api/chat", { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const onUpdateUser = (updatedUser) => {
    // Обновляем информацию о пользователе в состоянии
    localStorage.setItem("userInfo", JSON.stringify(updatedUser));
    window.location.reload(); // Перезагрузка страницы для обновления UI
  };
  

  return (
    <>
      <Box
        d="flex"
        justifyContent="space-between"
        alignItems="center"
        bg={useColorModeValue("white", "#2d3748")}
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="0px"
      >
        <Tooltip label="Поиск контактов" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
          </Button>
        </Tooltip>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "Нет новых сообщений"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `Новое сообщение в ${notif.chat.chatName}`
                    : `Новое сообщение от ${getSender(notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Tooltip label={colorMode === "light" ? "Тёмная тема" : "Светлая тема"} hasArrow placement="bottom-end">
            <Button p={1} onClick={toggleColorMode} variant="ghost">
              {colorMode === "light" ? (
                <MoonIcon fontSize="2xl" m={2} />
                ) : (
                <SunIcon fontSize="2xl" m={2} />
              )}
            </Button>
          </Tooltip>

          <Menu>
            <MenuButton ml={2} p={1} as={Button} bg="transparent">
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
                m={2}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>Профиль</MenuItem>
              </ProfileModal>
              <ProfileUpdateModal user={user} onUpdateUser={onUpdateUser}>
                <MenuItem>Изменить профиль</MenuItem>
              </ProfileUpdateModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Выйти</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Поиск контактов</DrawerHeader>
          <DrawerBody>
            <Box d="flex" pb={2}>
              <Input
                placeholder="Имя или e-mail"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Поиск</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
