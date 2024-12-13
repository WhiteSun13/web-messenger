// theme.js
import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const customTheme = extendTheme({
  config: {
    initialColorMode: "light", // Начальный цвет (light или dark)
    useSystemColorMode: false, // Автоматическая тема в зависимости от настроек ОС
  },
  styles: {
    global: (props) => ({
      body: {
        bg: mode("#36c3e3 linear-gradient(190deg, #2a8d9c 40%, transparent 70%) top left no-repeat;", "#15172e linear-gradient(190deg, #000000 40%, transparent 70%) top left no-repeat;")(props),
      },
    }),
  },
});

export default customTheme;