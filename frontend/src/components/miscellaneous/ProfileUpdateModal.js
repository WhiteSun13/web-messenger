import { useDisclosure } from "@chakra-ui/hooks";
import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  IconButton,
  Text,
  Image,
  Button,
  Input,
  useColorModeValue,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useState } from "react";

function ProfileUpdateModal({ user, onUpdateUser, children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const txtColorModeValue = useColorModeValue("black", "white");

  const [name, setName] = useState(user.name);
  const [pic, setPic] = useState(null);
  const [picUrl, setPicUrl] = useState(user.pic);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPic(file);
      setPicUrl(URL.createObjectURL(file)); // отображаем превью
    }
  };

  const handleSubmit = async () => {
    if (!name) {
      setError("Имя обязательно");
      return;
    }

    setError(""); // Очистка ошибок перед запросом

    try {
      let uploadedPicUrl = picUrl; // Текущий URL, если фото не обновляется

      if (pic) {
        const data = new FormData();
        
        data.append("file", pic);
        data.append("upload_preset", "chat-app");
        data.append("cloud_name", process.env.REACT_APP_CLOUD_NAME);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/dkrhez4sn/image/upload`,
          {
            method: "POST",
            body: data,
          }
        );
        const picData = await res.json();

        if (!res.ok || !picData.secure_url) {
          throw new Error("Ошибка при загрузке фото");
        }

        uploadedPicUrl = picData.secure_url;
      }

      // Отправка данных на сервер для обновления профиля
      const response = await fetch(`/api/user/updateProfile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId: user._id, newName: name, newPic: uploadedPicUrl }),
      });

      if (!response.ok) {
        throw new Error("Ошибка обновления профиля");
      }

      const updatedUser = await response.json();
      onUpdateUser(updatedUser); // Обновляем родительский компонент
      onClose();
    } catch (err) {
      setError(err.message || "Неизвестная ошибка");
      console.error(err);
    }
  };

  return (
    <>
      {children ? (
        <span onClick={onOpen}> {children} </span>
      ) : (
        <IconButton
          d={{ base: "flex" }}
          icon={<ViewIcon />}
          onClick={onOpen}
          color={txtColorModeValue}
        />
      )}

      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent h="auto">
          <ModalHeader fontSize="40px" fontFamily="Noto sans" d="flex" justifyContent="center">
            Редактировать профиль
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            d="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
            p={4}
          >
            <FormControl isInvalid={error}>
              <FormLabel htmlFor="name">Имя</FormLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите ваше имя"
              />
              <FormErrorMessage>{error}</FormErrorMessage>
            </FormControl>

            <FormControl mt={4}>
              <FormLabel htmlFor="pic">Фото профиля</FormLabel>
              <Input type="file" accept="image/*" id="pic" onChange={handleFileChange} />
              {picUrl && (
                <Image
                  borderRadius="full"
                  boxSize="150px"
                  src={picUrl}
                  alt="Preview"
                  mt={4}
                />
              )}
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
              Сохранить
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Отмена
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ProfileUpdateModal;
