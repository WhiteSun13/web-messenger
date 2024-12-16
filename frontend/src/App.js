import "./App.css";
import Home from "./pages/Home";
import { Route } from "react-router-dom";
import Chat from "./pages/Chat";

// Проверка поддержки уведомлений
if ("Notification" in window) {
  // Запрашиваем разрешение у пользователя
  Notification.requestPermission().then(permission => {
      if (permission === "granted") {
          console.log("Разрешение на уведомления получено.");
      } else {
          console.log("Разрешение на уведомления не получено.");
      }
  });
}

function App() {
  return (
    <div className="App">
      <Route path="/" component={Home} exact />
      <Route path="/chats" component={Chat} />
    </div>
  );
}

export default App;
