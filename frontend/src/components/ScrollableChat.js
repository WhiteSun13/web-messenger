import { Avatar, Tooltip, useDisclosure, Modal, ModalOverlay, ModalContent, ModalBody, Image } from "@chakra-ui/react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { useState } from "react";

function ScrollableChat({ messages }) {
  const { user } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Управление модальным окном
  const [selectedImage, setSelectedImage] = useState(null); // Состояние для выбранного изображения

  // Функция для форматирования даты
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); // Преобразуем дату в строку
  };

  // Функция для открытия модального окна и установки изображения
  const handleImageClick = (image) => {
    setSelectedImage(image);
    onOpen();
  };

  return (
    <>
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
                      backgroundColor: `${m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
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
                  </span>
                ) : null}
              </div>
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
                    cursor: "pointer", // Добавляем курсор для указания кликабельности
                  }}
                  onClick={() => handleImageClick(m.image)} // Открываем модалку
                />
              )}
              {/* Добавляем отображение даты и времени */}
              <div
                style={{
                  fontSize: "0.8em",
                  color: "gray",
                  marginTop: "5px",
                  alignSelf: m.sender._id === user._id ? "flex-end" : "flex-start",
                }}
              >
                {formatDate(m.timestamp)} {/* Отображаем дату */}
              </div>
            </div>
          ))}
      </ScrollableFeed>
      {/* Модальное окно для изображения */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent bg="transparent">
          <ModalBody display="flex" justifyContent="center" alignItems="center" p={0}>
            {selectedImage && (
              <Image src={selectedImage} alt="Selected" borderRadius="10px" />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ScrollableChat;
