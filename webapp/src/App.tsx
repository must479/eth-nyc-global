import { ChakraProvider, useDisclosure } from "@chakra-ui/react";
import Layout from "./Components/Layout";
import ConnectButton from "./Components/ConnectButton";
import AccountModal from "./Components/AccountModal";
import { Button, Box, Text } from "@chakra-ui/react";
import "./App.css";
import CoinSwapper from "./CoinSwapper/CoinSwapper";
import Web3Provider from "./network";
import { Route } from "react-router-dom";
import Liquidity from "./Liquidity/Liquidity";
import NarBar from "./NavBar/NavBar";
import { SnackbarProvider } from "notistack";
import { createTheme, ThemeProvider } from "@material-ui/core";
//import NameForm from "./components/CButton/currencybutton"
import "@fontsource/inter";

function getEthAmount(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    console.log(event.target.value);
}

function getTimeHorizon(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    console.log(event.target.value);
}

function getFrequency(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault();
    console.log(event.target.value);
}

const theme = createTheme({
  palette: {
    primary: {
      main: "#ff0000",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#9e9e9e",
      contrastText: "#ffffff",
    },
  },
});

const App = () => {
  return (
    <div className="App">
      <SnackbarProvider maxSnack={3}>
        <ThemeProvider theme={theme}>
          <Web3Provider
            render={(network: React.ChangeEvent<HTMLInputElement>) => (
              <div>
                <NarBar />
                <Route path="/Alternative-Uniswap-Interface/">
                  <CoinSwapper network={network} />
                </Route>

                <Route path="/Alternative-Uniswap-Interface/liquidity">
                  <Liquidity network={network} />
                </Route>
              </div>
            )}
          ></Web3Provider>
        </ThemeProvider>
      </SnackbarProvider>
    </div>
  );
};

export default App;
