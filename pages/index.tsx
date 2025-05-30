import { CandyMachine, DateTime, PublicKey, formatDateTime } from "@metaplex-foundation/js";
import {
  Box,
  CircularProgress,
  styled,
  Button,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  Link,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useMemo, useState } from "react";
import Countdown from "react-countdown";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useSnackbar } from "notistack";

import {
  guestIdentity,
  Metaplex,
  walletAdapterIdentity,
  FindNftsByOwnerOutput,
} from "@metaplex-foundation/js";

export default function Home() {
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [candyMachine, setCandyMachine] = useState<CandyMachine | undefined>();
  // const [userTokens, setUserTokens] = useState<FindNftsByOwnerOutput | undefined>();
  // const [userMint, setUserMint] = useState<PublicKey>();
  // const [userGroupName, setUserGroupName] = useState<string>();
  // const [userGroupNumber, setUserGroupNumber] = useState<number>(2);
  // const [startTime, setStartTime] = useState<Date>();
  const [userRemaining, setUserRemaining] = useState<number>(0);
  const [itemsRemaining, setItemsRemaining] = useState<string>();
  const [tokenPrice, setTokenPrice] = useState<Number>(0);
  const [solPrice, setSolPrice] = useState<Number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [nftImage, setNftImage] = useState<string>("");
  const [explorerLink, setExplorerLink] = useState<string>("");

  const { connection } = useConnection();
  const { wallet, publicKey } = useWallet();
  const { enqueueSnackbar } = useSnackbar();

  const isDesktop = useMediaQuery("(min-width: 1200px)");
  // const CM_ID = "9VS1GVnhv6JHgmkkPfu87HHccpaSuoeAY6gfTBs23sfK";
  const CM_ID = "FLMANM6ZXaMoNgAGEtKgABYhkYjzFrbGr4xtFCReQ8n1";
  const CM_NAME = "Bread Heads";
  const BH_COLLECTION = "44jmFBzJEw6hndKToYJtv1dKqey8NkfVbUdMgJaBevGF";
  const CRUMBS = "Bqf4Ep42BVL6gbFc47WUrV1jWhkPxYVbzqtMHaE7L63F";

  const handleClose = () => {
    setIsModalOpen(false);
    console.log(isModalOpen);
  };

  const metaplex = useMemo(() => {
    return connection
      ? Metaplex.make(connection)?.use(
        wallet ? walletAdapterIdentity(wallet.adapter) : guestIdentity()
      )
      : null;
  }, [wallet, connection]);

  const onMintCrumbsClick = async () => {
    try {
      if (!candyMachine) throw new Error("No CandyMachine");
      setIsModalOpen(true);
      setIsFetching(true);
      const mint = await metaplex?.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority: candyMachine.authorityAddress,
        group: "CRUMB",
      });

      const mintResponse = await mint?.response;
      setIsFetching(false);
      if (mintResponse) {
        mint?.nft.json?.image ? setNftImage(mint?.nft.json?.image) : null;
        mint?.response.signature
          ? setExplorerLink(`https://solscan.io/tx/${mint?.response.signature}`)
          : null;
      }
      getCandyMachine();
    } catch (error) {
      console.error("Mint Error", error);
      enqueueSnackbar("Mint Error: Check console logs for more details", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    }
  };

  const onMintSolClick = async () => {
    try {
      if (!candyMachine) throw new Error("No CandyMachine");
      setIsModalOpen(true);
      setIsFetching(true);
      const mint = await metaplex?.candyMachines().mint({
        candyMachine,
        collectionUpdateAuthority: candyMachine.authorityAddress,
        group: "SOL",
      });

      const mintResponse = await mint?.response;
      setIsFetching(false);
      if (mintResponse) {
        mint?.nft.json?.image ? setNftImage(mint?.nft.json?.image) : null;
        mint?.response.signature
          ? setExplorerLink(`https://solscan.io/tx/${mint?.response.signature}`)
          : null;
      }
      getCandyMachine();
    } catch (error) {
      console.error("Mint Error", error);
      enqueueSnackbar("Mint Error: Check console logs for more details", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    }
  };

  const getCandyMachine = async () => {
    try {
      const cmPublicKey = new PublicKey(CM_ID ?? "");
      const candyMachine = await metaplex
        ?.candyMachines()
        .findByAddress({ address: cmPublicKey });

      console.log(candyMachine);
      if (!candyMachine) throw new Error("No Candymachine at address");
      setCandyMachine(candyMachine);
      setItemsRemaining(candyMachine?.itemsRemaining.toString());
    } catch (error) {
      console.log("Fetching CM Error", error);
      enqueueSnackbar(
        "Fetching CM Error: Check console logs for more details",
        {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        }
      );
    }

  };

  // const getUserTokens = async () => {
  //   try {
  //     let tokens = await metaplex?.nfts().findAllByOwner({
  //       owner: publicKey as PublicKey,
  //     });
  //     console.log(tokens);
  //     setUserTokens(tokens);
  //   } catch (error) {
  //     console.log("Fetching User Tokens Error", error);
  //     enqueueSnackbar(
  //       "Fetching User Tokens Error: Check console logs for more details",
  //       {
  //         variant: "error",
  //         anchorOrigin: { vertical: "top", horizontal: "right" },
  //       }
  //     );
  //   }
  // };

  const getUserLimit = async () => {
    try {
      console.log({
        id: 1,
        user: publicKey as PublicKey,
        candyGuard: candyMachine?.candyGuard?.address as PublicKey,
        candyMachine: candyMachine?.address as PublicKey,
      });
      let mintLimitAddress = metaplex?.candyMachines().pdas().mintLimitCounter({
        id: 1,
        user: publicKey as PublicKey,
        candyGuard: candyMachine?.candyGuard?.address as PublicKey,
        candyMachine: candyMachine?.address as PublicKey,
      });
      let data = await metaplex?.connection.getAccountInfo(mintLimitAddress as PublicKey);
      let mintCount: number = data?.data[0] || 0;
      let mintLimit: number = candyMachine?.candyGuard?.guards.mintLimit?.limit as number;
      setUserRemaining(mintLimit - mintCount);
      console.log("User Remaining: ", userRemaining);
    } catch (error) {
      console.log("Fetching User Mint Limit Error", error);
      enqueueSnackbar(
        "Fetching User Mint Limit Error: Check console logs for more details",
        {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        }
      );
    }
  };

  // const getUserGroup = () => {
  //   if (userTokens) {
  //     for (let nft of userTokens) {
  //       if (nft.collection?.address.toString() === BH_COLLECTION && nft.collection?.verified) {
  //         setUserGroupName("HOLDER");
  //         setUserGroupNumber(0);
  //         setUserMint(nft.address);
  //         console.log("User Group: ", userGroupName);
  //         console.log("User Group Number: ", userGroupNumber);
  //         return;
  //       }
  //     }

  //     for (let nft of userTokens) {
  //       if ((nft.model === "metadata" && nft.mintAddress.toString() == CRUMBS) || (nft.model === "nft" && nft.address.toString() == CRUMBS) || (nft.model === "sft" && nft.address.toString() == CRUMBS)) {
  //         setUserGroupName("CRUMBS");
  //         setUserGroupNumber(1);
  //         console.log("User Group: ", userGroupName);
  //         console.log("User Group Number: ", userGroupNumber);
  //         return;
  //       }
  //     }

  //     setUserGroupName("SOL");
  //     setUserGroupNumber(2);
  //     console.log("User Group: ", userGroupName);
  //     console.log("User Group Number: ", userGroupNumber);
  //   }
  // };

  // const getStartTime = () => {
  //   try {
  //     if (!candyMachine) throw new Error("No CandyMachine");
  //     let time;
  //     if (userGroupNumber === 0) {
  //       time = candyMachine?.candyGuard?.groups[userGroupNumber].guards.startDate?.date;
  //     } else {
  //       time = candyMachine?.candyGuard?.guards.startDate?.date;
  //     }
  //     setStartTime(new Date(formatDateTime(time as DateTime)));
  //     console.log("Start Time: ", startTime);
  //     console.log("Now: ", new Date(Date.now()));
  //   } catch (error) {
  //     console.log("Fetching Start Time Error", error);
  //     enqueueSnackbar(
  //       "Fetching Start Time Error: Check console logs for more details",
  //       {
  //         variant: "error",
  //         anchorOrigin: { vertical: "top", horizontal: "right" },
  //       }
  //     );
  //   }
  // }

  useEffect(() => {
    setPageLoading(true);
    getCandyMachine();
    // getUserTokens();
    setPageLoading(false);
  }, [publicKey]);

  useEffect(() => {
    if (!candyMachine) return;
    console.log(candyMachine);
    const tokenPrice = Number(
      // candyMachine?.candyGuard?.groups[1].guards.tokenPayment?.amount.basisPoints.toString()
    );
    setTokenPrice(1);
    console.log(tokenPrice);
    const solPrice = Number(
      //candyMachine?.candyGuard?.groups[2].guards.solPayment?.amount.basisPoints.toString()
    );
    setSolPrice(0.1);
    console.log(solPrice);

    // getUserGroup();
    getUserLimit();
  }, [candyMachine, publicKey]);

  // useEffect(() => {
  //   if (!candyMachine) return;
  //   // getStartTime();
  // }, [candyMachine, userGroupNumber, publicKey]);

  return (
    <PageWrapper>
      {isDesktop ? (
        <TopBar>
          <WalletMultiButton style={{ background: "black", color: "white" }} />
        </TopBar>
      ) : null}
      <MainBody>
        <NftModal
          isOpen={isModalOpen}
          explorerLink={explorerLink}
          onClose={handleClose}
          nftImage={nftImage}
          isFetching={isFetching}
        />
        <ImageBody>
          <img
            style={{
              maxHeight: "400px",
              maxWidth: "400px",
              height: "100%",
              width: "100%",
              justifySelf: isDesktop ? "flex-start" : "center",
            }}
            src="./breads.gif"
            alt="NFT"
          />
          <p
            style={{
              color: "grey",
              textAlign: "center",
              lineHeight: "32px",
              fontWeight: 600,
              fontSize: "20px",
              marginTop: "16px",
              marginBlockEnd: "0px",
            }}
          >
            {itemsRemaining} available
          </p>
        </ImageBody>

        {pageLoading ? (
          <CircularProgress />
        ) : (
          <HeroTitleContainer>
            <h1
              style={{
                color: "black",
                fontSize: "36px",
                marginBlockEnd: "0px",
                marginBlockStart: isDesktop ? ".67em" : "0px",
              }}
            >
              {CM_NAME}
            </h1>
            <Box
              style={{
                paddingRight: isDesktop ? "0px" : "8px",
                paddingLeft: isDesktop ? "0px" : "8px",
                textAlign: isDesktop ? "left" : "center",
              }}
            >
              <p style={{ color: "grey" }}>
                10K Baby Bread Head Bases to pilot Metaplex's Fusion Protocol.
              </p>
            </Box>
            {/* <Countdown date={startTime}> */}
            <MintContainer>
                {(publicKey && userRemaining > 0) && (
                  <MintButton
                    size="large"
                    onClick={onMintCrumbsClick}
                    disabled={!candyMachine || !publicKey}
                    style={{ marginBottom: "8px" }}
                  >
                    <p
                      style={{
                        fontSize: "24px",
                        fontWeight: 600,
                        textTransform: "none",
                      }}
                    >
                      {publicKey ? "Mint with CRUMBS" : "Connect Your Wallet"}
                    </p>
                  </MintButton>
                )}
                {(publicKey && userRemaining > 0) && (
                  <MintButton
                    size="large"
                    onClick={onMintSolClick}
                    disabled={!candyMachine || !publicKey}
                  >
                    <p
                      style={{
                        fontSize: "24px",
                        fontWeight: 600,
                        textTransform: "none",
                      }}
                    >
                      {publicKey ? "Mint with SOL" : "Connect Your Wallet"}
                    </p>
                  </MintButton>
                )}
                {(!publicKey) && (
                  <WalletMultiButton
                    style={{
                      color: "white",
                      background: "black",
                      width: "100%",
                      borderRadius: "100px",
                      textAlign: "center",
                      display: "inline-block",
                      height: "64px",
                    }}
                  />
                )}
                {candyMachine?.candyGuard?.guards.mintLimit?.limit && (
                  <h3
                    style={{
                      color: "black",
                      textAlign: "center",
                      fontSize: "24px",
                      textTransform: "none",
                      fontWeight: 400,
                      marginBlockEnd: "0px",
                    }}
                  >
                    {userRemaining} mints left
                  </h3>
                )}
                {/* {(startTime?.getTime() && (startTime?.getTime() >= Date.now())) && (
                  <h2>Mint not yet active</h2>
                )} */}
              </MintContainer>
            {/* </Countdown> */}
            <h2
              style={{
                color: "grey",
                marginBottom: isDesktop ? "64px" : "0px",
                marginBlockStart: "0px",
                fontWeight: 600,
                fontSize: "24px",
              }}
            >
              <>{tokenPrice.toLocaleString()} $CRUMB per NFT</>
            </h2>
            <h2
              style={{
                color: "grey",
                marginBottom: isDesktop ? "64px" : "0px",
                marginBlockStart: "0px",
                fontWeight: 600,
                fontSize: "24px",
              }}
            >
              <>OR</>
            </h2>
            <h2
              style={{
                color: "grey",
                marginBottom: isDesktop ? "64px" : "0px",
                marginBlockStart: "0px",
                fontWeight: 600,
                fontSize: "24px",
              }}
            >
              <>{solPrice.toLocaleString()} SOL per NFT</>
            </h2>
          </HeroTitleContainer>
        )}
      </MainBody>
    </PageWrapper>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  nftImage: string;
  explorerLink: string;
  isFetching: boolean;
}

const NftModal: React.FC<ModalProps> = ({
  nftImage,
  isOpen,
  onClose,
  explorerLink,
  isFetching,
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <Box
        style={{
          padding: "6x",
          display: "flex",
          justifyContent: "flex-start",
          flexDirection: "column",
          textAlign: "center",
          borderRadius: "4px",
        }}
      >
        <Box style={{ display: "flex", justifyContent: "flex-end" }}>
          {!isFetching ? (
            <IconButton
              onClick={onClose}
              style={{ color: isFetching ? "white" : "black" }}
            >
              <CloseIcon />
            </IconButton>
          ) : null}
        </Box>
        <DialogTitle>
          {isFetching ? "Minting..." : "Mint successful, enjoy your NFT!"}
        </DialogTitle>
        {isFetching ? (
          <DialogContent>
            <img
              style={{
                display: "block",
                height: "100%",
                width: "100%",
                justifySelf: "center",
                padding: "16px",
                maxWidth: "520px",
                maxHeight: "520px",
              }}
              src="./breads.gif"
              alt="NFT"
            />
            Which one will you get?
          </DialogContent>
        ) : (
          <DialogContent>
            <img
              src={nftImage}
              style={{
                display: "block",
                height: "100%",
                width: "100%",
                padding: "16px",
              }}
            />
            <Link target="_blank" href={explorerLink}>
              View the details here
            </Link>
          </DialogContent>
        )}
      </Box>
    </Dialog>
  );
};

const PageWrapper = styled(Box)(({ theme }) => ({
  height: "100vh",
  width: "100vw",
  background: "#fbf3e7",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  marginTop: "16px",
  [theme.breakpoints.up("lg")]: {
    overflow: "auto",
  },
}));

const TopBar = styled(Box)`
  display: flex;
  justify-content: flex-end;
  padding: 12px;
`;

const MainBody = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexDirection: "column",
  width: "100%",
  alignSelf: "center",

  [theme.breakpoints.up("lg")]: {
    flexDirection: "row",
  },
}));

const ImageBody = styled(Box)(({ theme }) => ({
  display: "flex",
  padding: "16px, 16px, 0px, 16px",
  marginRight: "0px",
  alignItems: "center",
  flexDirection: "column",
  width: "75%",
  height: "75%",
  flex: 1,

  [theme.breakpoints.up("lg")]: {
    padding: "12px",
    marginRight: "48px",
  },
}));

const MintButton = styled(Button)(({ theme }) => ({
  background: "black",
  color: "white",
  borderRadius: "100px",
  width: "100%",
  height: "64px",
  "&:hover": {
    color: "white",
    background: "#333333",
  },
  "&:disabled": {
    color: "white",
    background: "black",
  },

  [theme.breakpoints.up("lg")]: {
    padding: "32px 21px 32px 21px",
    alignSelf: "center",
    width: "100%",
  },
}));

const MintContainer = styled(Box)(({ theme }) => ({
  display: "flex",

  borderRadius: "16px",
  alignItems: "center",
  flexDirection: "column",
  padding: "32px 24px 32px 24px",
  maxWidth: "517px",
  width: "100%",

  [theme.breakpoints.up("lg")]: {
    padding: "12px",
    //marginRight: "60px",
    width: "100%",
    alignItems: "center",
    border: "2px solid rgba(185, 195, 199)",
  },
}));

const HeroTitleContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  alignItems: "center",
  width: "90%",
  justifyContent: "center",
  padding: "8px, 16px, 16px, 16px",

  [theme.breakpoints.up("lg")]: {
    padding: "12px",
    marginRight: "200px",
    width: "100%",
    maxWidth: "530px",
    alignItems: "flex-start",
  },
}));
