import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import {
  connectWallet,
  attachExistingSession,
  createBet,
  joinBet,
  resolveBet,
  cancelBet,
  getActiveBets,
  getBalance,
  verifyXLayerAndContract,
  getContractAdmin,
  switchNetwork,
} from "./web3";
import { CONFIG } from "./config";
import {
  resolveContractAddress,
  getContractAddress,
  isContractAddressConfigured,
} from "./contractConfig";
import { fetchUpcomingMatches } from "./matchesApi";
import {
  getStoredUsername,
  setStoredUsername,
  bindUsernameToWallet,
  getUsernameForWallet,
  getDisplayNameForAddress,
} from "./profileStorage";
import { fetchAllProfiles, registerProfileOnServer } from "./profileApi";
import "./App.css";

const BET_STATUS = ["PENDING", "ACTIVE", "RESOLVED", "CANCELLED"];
const OUTCOMES = ["PENDING", "TEAM_A", "TEAM_B", "DRAW"];

const ZERO = "0x0000000000000000000000000000000000000000";

const addrEq = (a, b) =>
  Boolean(a && b && a.toLowerCase() === b.toLowerCase());

function App() {
  const [usernameInput, setUsernameInput] = useState("");
  const [username, setUsername] = useState(() => getStoredUsername());
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchesError, setMatchesError] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);

  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const userAddressRef = React.useRef(userAddress);
  useEffect(() => {
    userAddressRef.current = userAddress;
  }, [userAddress]);
  const [balance, setBalance] = useState("0");

  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [createAmount, setCreateAmount] = useState("");
  const [joinAmount, setJoinAmount] = useState("");
  const [selectedBetId, setSelectedBetId] = useState("");

  const [verify, setVerify] = useState({
    chainId: null,
    chainOk: false,
    contractDeployed: false,
    contractInterfaceOk: false,
    contractInterfaceError: "",
  });
  const [serverProfiles, setServerProfiles] = useState({});
  const [profilesOnline, setProfilesOnline] = useState(false);
  const [contractReady, setContractReady] = useState(false);
  const [contractLoadError, setContractLoadError] = useState("");
  const [contractAdmin, setContractAdmin] = useState("");
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return sessionStorage.getItem("matchstake_onboarded") === "true";
  });

  const isContractReady = contractReady && isContractAddressConfigured();
  const isContractAdmin =
    contractAdmin &&
    userAddress &&
    addrEq(contractAdmin, userAddress);
  const myDisplayName =
    (userAddress && getUsernameForWallet(userAddress)) || username || "";

  const matchKey = (name) =>
    (name || "").trim().toLowerCase().replace(/\s+/g, " ");

  const betsForSelectedMatch = useMemo(() => {
    if (!selectedMatch) return [];
    const key = matchKey(selectedMatch.name);
    return bets.filter((b) => matchKey(b.matchName) === key);
  }, [bets, selectedMatch]);

  const openBetsOnMatch = useMemo(
    () =>
      betsForSelectedMatch.filter(
        (bet) =>
          bet.status === 0 &&
          addrEq(bet.teamBBetter, ZERO) &&
          !addrEq(bet.teamABetter, userAddress)
      ),
    [betsForSelectedMatch, userAddress]
  );

  const runVerification = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const v = await verifyXLayerAndContract();
      setVerify(v);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const refreshBets = useCallback(async () => {
    if (!isContractReady) {
      setBets([]);
      return;
    }
    try {
      const activeBets = await getActiveBets();
      setBets(activeBets);
    } catch (error) {
      console.error("Error fetching bets:", error);
      setBets([]);
    }
  }, [isContractReady]);

  const refreshBalance = useCallback(async () => {
    try {
      const bal = await getBalance();
      setBalance(bal);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }, []);

  const refreshServerProfiles = useCallback(async () => {
    try {
      const profiles = await fetchAllProfiles();
      setServerProfiles(profiles);
      setProfilesOnline(true);
    } catch (e) {
      console.warn("Profile API unavailable:", e);
      setProfilesOnline(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setContractLoadError("");
      const addr = await resolveContractAddress();
      if (addr) {
        setContractReady(true);
      } else {
        setContractReady(false);
        setContractLoadError(
          "Deploy MatchStake: add PRIVATE_KEY to contracts/.env, then run cd contracts && npm run deploy:xlayer. Use X Layer testnet chain ID 1952 in MetaMask."
        );
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedBetId) return;
    const bet = openBetsOnMatch.find(
      (b) => b.betId.toString() === String(selectedBetId)
    );
    if (bet) {
      try {
        setJoinAmount(parseFloat(ethers.formatEther(bet.amount)).toString());
      } catch {
        /* ignore */
      }
    }
  }, [selectedBetId, openBetsOnMatch]);

  useEffect(() => {
    if (!walletConnected || !isContractReady) {
      setContractAdmin("");
      return;
    }
    (async () => {
      try {
        const admin = await getContractAdmin();
        setContractAdmin(admin);
      } catch (e) {
        console.warn("Could not read contract admin:", e);
        setContractAdmin("");
      }
    })();
  }, [walletConnected, isContractReady]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setMatchesLoading(true);
      setMatchesError("");
      try {
        const list = await fetchUpcomingMatches();
        if (!cancelled) setMatches(list);
      } catch (e) {
        if (!cancelled) setMatchesError(e.message || "Could not load matches.");
      } finally {
        if (!cancelled) setMatchesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    refreshServerProfiles();
    const id = setInterval(refreshServerProfiles, 12000);
    return () => clearInterval(id);
  }, [refreshServerProfiles]);

  useEffect(() => {
    if (!contractReady || !walletConnected) return;
    refreshBets();
    runVerification();
  }, [contractReady, walletConnected, refreshBets, runVerification]);

  useEffect(() => {
    const checkWallet = async () => {
      if (!window.ethereum) return;
      try {
        await resolveContractAddress();
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          await attachExistingSession();
          setUserAddress(accounts[0]);
          setWalletConnected(true);
          const wName = getUsernameForWallet(accounts[0]);
          if (wName) {
            setUsername(wName);
          } else {
            const saved = getStoredUsername();
            if (saved) {
              bindUsernameToWallet(accounts[0], saved);
              setUsername(saved);
            }
          }
          await runVerification();
        }
      } catch (e) {
        console.warn("checkWallet:", e);
      }
    };
    checkWallet();
  }, [runVerification]);

  useEffect(() => {
    if (!walletConnected) return;
    refreshBalance();
    refreshBets();
  }, [walletConnected, refreshBalance, refreshBets]);

  useEffect(() => {
    if (!window.ethereum) return undefined;
    const onChain = () => {
      runVerification();
      refreshBets();
      refreshBalance();
    };
    const onAccounts = (accounts) => {
      const currentAddr = userAddressRef.current || "";
      const newAddr = accounts[0] || "";
      
      // Only reload if we were already connected to an account,
      // and we are switching to a different active account.
      if (
        currentAddr &&
        newAddr &&
        newAddr.toLowerCase() !== currentAddr.toLowerCase()
      ) {
        window.location.reload();
      } else if (!newAddr) {
        // Handle disconnect: update state instead of reloading
        setUserAddress("");
        setWalletConnected(false);
      } else if (newAddr && !currentAddr) {
        // Handle initial connection or session restore: just update state
        setUserAddress(newAddr);
        setWalletConnected(true);
        runVerification();
        refreshBets();
        refreshBalance();
      }
    };
    window.ethereum.on("chainChanged", onChain);
    window.ethereum.on("accountsChanged", onAccounts);
    return () => {
      window.ethereum.removeListener("chainChanged", onChain);
      window.ethereum.removeListener("accountsChanged", onAccounts);
    };
  }, [walletConnected, runVerification, refreshBets, refreshBalance]);



  const handleSwitchNetwork = async () => {
    try {
      setLoading(true);
      setMessage("Switching network to X Layer Testnet...");
      await switchNetwork();
      setMessage("Switched network successfully!");
      await runVerification();
    } catch (error) {
      setMessage(error.message || "Could not switch network automatically.");
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingConfirm = async () => {
    const name = usernameInput.trim();
    if (!name || !/^[a-zA-Z0-9_]{2,24}$/.test(name)) {
      setMessage("Please enter a valid display name (2-24 characters, letters/numbers/underscore).");
      return;
    }
    if (!walletConnected || !verify.chainOk) {
      setMessage("Please connect your wallet and switch to the X Layer Testnet.");
      return;
    }
    setLoading(true);
    try {
      setStoredUsername(name);
      setUsername(name);
      bindUsernameToWallet(userAddress, name);
      await registerProfileOnServer(userAddress, name);
      await refreshServerProfiles();
      sessionStorage.setItem("matchstake_onboarded", "true");
      setIsOnboarded(true);
      setMessage("Welcome to MatchStake!");
    } catch (error) {
      console.warn("Could not register on server, proceeding with local profile:", error);
      sessionStorage.setItem("matchstake_onboarded", "true");
      setIsOnboarded(true);
      setMessage("Welcome to MatchStake! (Local Session)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (myDisplayName && !usernameInput) {
      setUsernameInput(myDisplayName);
    }
  }, [myDisplayName, usernameInput]);

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      setMessage("");
      const address = await connectWallet();
      setUserAddress(address);
      setWalletConnected(true);
      const wName = getUsernameForWallet(address);
      if (wName) {
        setUsername(wName);
      } else {
        const saved = getStoredUsername();
        if (saved) {
          bindUsernameToWallet(address, saved);
          setUsername(saved);
        }
      }
      setMessage("Wallet connected.");
      const nameToPublish = getUsernameForWallet(address) || getStoredUsername();
      if (nameToPublish && /^[a-zA-Z0-9_]{2,24}$/.test(nameToPublish)) {
        try {
          await registerProfileOnServer(address, nameToPublish);
          await refreshServerProfiles();
        } catch (e) {
          console.warn("Profile sync on connect:", e);
        }
      }
      await refreshBalance();
      await refreshBets();
      await runVerification();
    } catch (error) {
      setMessage(error.message || "Unable to connect wallet.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    setUserAddress("");
    setWalletConnected(false);
    setBalance("0");
    setUsername("");
    setUsernameInput("");
    sessionStorage.removeItem("matchstake_onboarded");
    setMessage("Wallet disconnected.");
  };

  const handleSelectMatch = (m) => {
    setSelectedMatch(m);
    setSelectedBetId("");
    setJoinAmount("");
    setMessage("");
  };

  const requirePlayable = () => {
    if (!myDisplayName) {
      setMessage("Save a display name before staking.");
      return false;
    }
    if (!walletConnected) {
      setMessage("Connect your wallet first.");
      return false;
    }
    if (!isContractReady) {
      setMessage(
        contractLoadError ||
          "Contract not available. Deploy MatchStake to X Layer first."
      );
      return false;
    }
    if (!selectedMatch) {
      setMessage("Select a match first.");
      return false;
    }
    return true;
  };

  const handleCreateBet = async () => {
    if (!requirePlayable()) return;
    try {
      if (!createAmount || Number(createAmount) <= 0) {
        setMessage("Enter a stake amount greater than 0.");
        return;
      }
      setLoading(true);
      setMessage("Creating stake...");
      await createBet(selectedMatch.name, createAmount);
      setMessage("Stake created. Waiting for an opponent to join.");
      setCreateAmount("");
      await refreshBets();
      await refreshBalance();
    } catch (error) {
      setMessage(error.message || "Unable to create stake.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinBet = async () => {
    if (!requirePlayable()) return;
    try {
      if (!selectedBetId || !joinAmount) {
        setMessage("Select an open stake and enter the matching amount.");
        return;
      }
      const bet = openBetsOnMatch.find(
        (b) => b.betId.toString() === String(selectedBetId)
      );
      if (!bet) {
        setMessage("This stake is no longer available.");
        return;
      }
      setLoading(true);
      setMessage("Joining stake...");
      await joinBet(parseInt(selectedBetId, 10), joinAmount, bet.amount);
      setMessage("You joined the stake. Good luck.");
      setSelectedBetId("");
      setJoinAmount("");
      await refreshBets();
      await refreshBalance();
    } catch (error) {
      setMessage(error.message || "Unable to join stake.");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveBet = async (betId, outcome) => {
    try {
      setLoading(true);
      setMessage("Resolving...");
      await resolveBet(betId, outcome);
      setMessage("Stake resolved.");
      await refreshBets();
    } catch (error) {
      setMessage(error.message || "Unable to resolve.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBet = async (betId) => {
    try {
      setLoading(true);
      setMessage("Cancelling...");
      await cancelBet(betId);
      setMessage("Open stake cancelled and refunded.");
      await refreshBets();
      await refreshBalance();
    } catch (error) {
      setMessage(error.message || "Unable to cancel.");
    } finally {
      setLoading(false);
    }
  };

  const formatOkb = (wei) => {
    try {
      return `${parseFloat(ethers.formatEther(wei)).toFixed(4)} OKB`;
    } catch {
      return String(wei);
    }
  };

  const xLayerReady =
    verify.chainOk && verify.contractDeployed && verify.contractInterfaceOk;

  const isUsernameLocked = Boolean(
    username || (userAddress && getUsernameForWallet(userAddress))
  );

  if (!isOnboarded) {
    return (
      <div className="app onboarding-page">
        <header className="header">
          <h1>MatchStake</h1>
          <p>
            Peer-to-peer match stakes on X Layer. Choose a username and connect
            your wallet to enter.
          </p>
        </header>

        <div className="onboarding-gate">
          <div className="onboarding-card">
            <h2>Enter the Arena</h2>
            
            <div className="onboarding-step">
              <label className="step-label">Step 1: Choose Display Name</label>
              <p className="step-desc">
                Your opponents will see this display name instead of your raw wallet address.
              </p>
              <div className="form-group">
                <input
                  type="text"
                  maxLength={24}
                  placeholder="Enter username (letters, numbers, underscore only)"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  disabled={loading || isUsernameLocked}
                />
              </div>
              {isUsernameLocked && (
                <div className="username-locked-badge">
                  [ VERIFIED DISPLAY NAME BOUND TO WALLET ]
                </div>
              )}
            </div>

            <div className="onboarding-step">
              <label className="step-label">Step 2: Connect Wallet & Network</label>
              {!walletConnected ? (
                <div>
                  <p className="step-desc">Connect your MetaMask wallet to interact with on-chain stakes.</p>
                  <button
                    type="button"
                    className="btn-full"
                    onClick={handleConnectWallet}
                    disabled={loading}
                  >
                    {loading ? "Connecting..." : "Connect MetaMask"}
                  </button>
                </div>
              ) : (
                <div className="wallet-status-box">
                  <div className="wallet-row">
                    <span className="text-muted">Detected Address:</span>
                    <strong className="wallet-address">{userAddress.slice(0, 6)}...{userAddress.slice(-4)}</strong>
                  </div>
                  <div className="wallet-row">
                    <span className="text-muted">Balance:</span>
                    <strong>{parseFloat(balance).toFixed(4)} OKB</strong>
                  </div>

                  <button
                    type="button"
                    className="btn-secondary btn-full btn-disconnect-wallet"
                    onClick={handleDisconnectWallet}
                    disabled={loading}
                  >
                    Disconnect Wallet
                  </button>

                  <div className="network-row-status">
                    {verify.chainOk ? (
                      <>
                        <div className="network-pill-ok">
                          Network: X Layer Testnet
                        </div>
                        <div className="onboarding-contract-status" style={{ marginTop: "12px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "8px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                            <span className="text-muted">Contract Address:</span>
                            <span style={{ color: "#fff", fontFamily: "monospace" }}>{getContractAddress() ? `${getContractAddress().slice(0, 6)}...${getContractAddress().slice(-4)}` : "None"}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                            <span className="text-muted">Bytecode:</span>
                            <span>{verify.contractDeployed ? <strong style={{ color: "#10b981" }}>Deployed</strong> : <strong style={{ color: "#ef4444" }}>Missing</strong>}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                            <span className="text-muted">Interface Check:</span>
                            <span>{verify.contractInterfaceOk ? <strong style={{ color: "#10b981" }}>Passed</strong> : <strong style={{ color: "#ef4444" }}>Failed</strong>}</span>
                          </div>
                          {!verify.contractInterfaceOk && verify.contractInterfaceError && (
                            <div style={{
                              marginTop: "8px",
                              padding: "8px 12px",
                              background: "rgba(220, 38, 38, 0.1)",
                              border: "1px solid rgba(220, 38, 38, 0.3)",
                              borderRadius: "6px",
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                              color: "#fca5a5",
                              wordBreak: "break-all",
                              textAlign: "left"
                            }}>
                              Error: {verify.contractInterfaceError}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="network-pill-error-box">
                        <div className="network-pill-error">
                          Wrong Network: Chain {verify.chainId || "unknown"}
                        </div>
                        <button
                          type="button"
                          className="btn-switch-network"
                          onClick={handleSwitchNetwork}
                          disabled={loading}
                        >
                          Switch MetaMask to X Layer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="onboarding-action">
              <button
                type="button"
                className="btn-confirm-enter"
                disabled={
                  loading ||
                  !walletConnected ||
                  !verify.chainOk ||
                  !usernameInput.trim() ||
                  !/^[a-zA-Z0-9_]{2,24}$/.test(usernameInput.trim())
                }
                onClick={handleOnboardingConfirm}
              >
                {loading ? "Entering..." : "Confirm & Enter DApp"}
              </button>
              
              {(!usernameInput.trim() || !/^[a-zA-Z0-9_]{2,24}$/.test(usernameInput.trim())) && (
                <p className="onboarding-helper-text text-warning">
                  Please enter a valid display name (2-24 characters, letters/numbers/underscore).
                </p>
              )}
              {walletConnected && !verify.chainOk && (
                <p className="onboarding-helper-text text-warning">
                  Please switch MetaMask network to X Layer Testnet.
                </p>
              )}
              {!walletConnected && (
                <p className="onboarding-helper-text text-warning">
                  Please connect your MetaMask wallet.
                </p>
              )}
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`message ${
              (() => {
                const x = message.toLowerCase();
                return (
                  x.includes("success") ||
                  x.includes("saved") ||
                  x.includes("good luck") ||
                  x.includes("welcome") ||
                  x.includes("waiting for") ||
                  x.includes("joined the stake") ||
                  x.includes("refunded") ||
                  x.includes("resolved.")
                );
              })()
                ? "success"
                : "error"
            }`}
          >
            {message}
          </div>
        )}

        <footer className="footer">
          <p>MatchStake hackathon demo · X Layer · Profile API on port 3001</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-top-bar">
          <h1>MatchStake</h1>
          
          <div className="header-profile-pill">
            <div className="profile-info">
              <span className="profile-name">{myDisplayName || "Anonymous"}</span>
              {userAddress && (
                <span className="profile-wallet text-muted">
                  {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </span>
              )}
            </div>
            <div className="profile-balance">
              {parseFloat(balance).toFixed(4)} OKB
            </div>
            <button
              type="button"
              className="btn-header-profile"
              onClick={() => {
                sessionStorage.removeItem("matchstake_onboarded");
                setIsOnboarded(false);
              }}
            >
              Exit
            </button>
          </div>
        </div>
        <p>
          Peer-to-peer match stakes on X Layer. Pick a fixture, open a stake, or
          join someone else at the same odds.
        </p>
        <div className="header-meta">
          <span className="meta-pill">{CONFIG.CHAIN_NAME}</span>
          <span className="meta-pill">Chain ID {CONFIG.CHAIN_ID}</span>
          <span
            className={`meta-pill ${profilesOnline ? "meta-pill-ok" : "meta-pill-warn"}`}
          >
            Names {profilesOnline ? "synced" : "offline"}
          </span>
        </div>
      </header>

      {!isContractReady && (
        <div className="banner banner-warn">
          <strong>MatchStake contract not loaded.</strong>{" "}
          {contractLoadError || (
            <>
              Run <code>cd contracts && npm run deploy:xlayer</code> (set{" "}
              <code>PRIVATE_KEY</code> in <code>contracts/.env</code>), then restart
              the frontend. Address is written to{" "}
              <code>frontend/public/contract-address.json</code> automatically.
            </>
          )}
          {getContractAddress() ? (
            <p className="banner-sub">
              Last known address in config: <code>{getContractAddress()}</code> — not
              verified on this network yet.
            </p>
          ) : null}
        </div>
      )}

      {walletConnected && (
        <div
          className={`banner ${
            xLayerReady ? "banner-success" : "banner-warn"
          }`}
        >
          <div className="banner-title">On-chain status</div>
          <ul className="banner-list">
            <li>
              Wallet network:{" "}
              {verify.chainId != null ? `chain ${verify.chainId}` : "unknown"}{" "}
              {verify.chainOk ? (
                "(matches X Layer)"
              ) : (
                <>
                  (switch to X Layer){" "}
                  <button
                    type="button"
                    className="btn-switch-inline"
                    onClick={handleSwitchNetwork}
                    style={{
                      padding: "4px 8px",
                      fontSize: "0.75rem",
                      borderRadius: "6px",
                      marginLeft: "10px",
                      background: "var(--primary-gradient)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Switch Network
                  </button>
                </>
              )}
            </li>
            <li>
              MatchStake contract:{" "}
              {verify.contractDeployed
                ? `bytecode found at configured address (${getContractAddress()})`
                : `no bytecode found at configured address (${getContractAddress() || "none"})`}
            </li>
            <li>
              Interface check:{" "}
              {verify.contractInterfaceOk ? (
                "getActiveBets OK — X Layer MatchStake in use"
              ) : (
                <>
                  <span className="text-warning">could not call getActiveBets — wrong address or ABI</span>
                  {verify.contractInterfaceError && (
                    <div style={{
                      marginTop: "6px",
                      padding: "8px 12px",
                      background: "rgba(220, 38, 38, 0.1)",
                      border: "1px solid rgba(220, 38, 38, 0.3)",
                      borderRadius: "6px",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      color: "#fca5a5",
                      wordBreak: "break-all"
                    }}>
                      Error details: {verify.contractInterfaceError}
                    </div>
                  )}
                </>
              )}
            </li>
          </ul>
        </div>
      )}

      <section className="section">
        <div className="section-head">
          <h2>Upcoming matches</h2>
          <button
            type="button"
            className="btn-secondary"
            disabled={matchesLoading}
            onClick={async () => {
              setMatchesLoading(true);
              try {
                const list = await fetchUpcomingMatches();
                setMatches(list);
                await refreshServerProfiles();
                if (walletConnected && isContractReady) await refreshBets();
              } finally {
                setMatchesLoading(false);
              }
            }}
          >
            Refresh data
          </button>
        </div>
        <p className="section-note">
          Data from TheSportsDB when available; otherwise demo fixtures for the
          hackathon. Click a row to open stakes for that match only.
        </p>
        {matchesLoading && <p className="text-muted">Loading fixtures…</p>}
        {matchesError && (
          <p className="text-error">{matchesError} Showing demo list.</p>
        )}
        <div className="match-grid">
          {matches.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`match-card ${
                selectedMatch?.id === m.id ? "match-card-active" : ""
              }`}
              onClick={() => handleSelectMatch(m)}
            >
              <div className="match-card-title">{m.name}</div>
              <div className="match-card-meta">{m.league}</div>
              {m.kickoff && (
                <div className="match-card-time text-muted">
                  {new Date(m.kickoff).toLocaleString()}
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {walletConnected && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Open stakes (all matches)</span>
            <span className="stat-value">
              {bets.filter((b) => addrEq(b.teamBBetter, ZERO)).length}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Your active stakes</span>
            <span className="stat-value">
              {
                bets.filter(
                  (b) =>
                    (b.status === 0 || b.status === 1) &&
                    (addrEq(b.teamABetter, userAddress) ||
                      addrEq(b.teamBBetter, userAddress))
                ).length
              }
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Selected match</span>
            <span className="stat-value">
              {selectedMatch ? selectedMatch.name : "None"}
            </span>
          </div>
        </div>
      )}

      <section className="section tips">
        <h2>How P2P stakes work here</h2>
        <ol className="tips-list">
          <li>
            Stakes are matched 1:1 in OKB. Creating a stake locks your deposit
            until someone joins or you cancel while still waiting.
          </li>
          <li>
            Joining must send exactly the same amount as the opener (the
            contract enforces this).
          </li>
          <li>
            Settlement is admin-only on this contract—demo for judges, not a
            production oracle.
          </li>
          <li>Use the same match title as the fixture when opening stakes.</li>
        </ol>
      </section>

      {selectedMatch && walletConnected && isContractReady && (
        <section className="section match-panel">
          <h2>Stakes · {selectedMatch.name}</h2>
          <p className="section-note">
            Only stakes whose on-chain title matches this fixture appear here.
          </p>

          <div className="sub-block">
            <h3>Open a stake</h3>
            <div className="form-group">
              <input
                type="number"
                placeholder="Amount (OKB)"
                value={createAmount}
                onChange={(e) => setCreateAmount(e.target.value)}
                disabled={loading}
                min="0"
                step="0.01"
              />
              <button type="button" onClick={handleCreateBet} disabled={loading}>
                {loading ? "Submitting…" : "Create stake"}
              </button>
            </div>
          </div>

          <div className="sub-block">
            <h3>Join a stake</h3>
            <div className="form-group">
              <select
                value={selectedBetId}
                onChange={(e) => setSelectedBetId(e.target.value)}
                disabled={loading || openBetsOnMatch.length === 0}
              >
                <option value="">Select an open stake…</option>
                {openBetsOnMatch.map((bet) => (
                  <option key={bet.betId} value={bet.betId}>
                    #{bet.betId.toString()} · {formatOkb(bet.amount)} ·{" "}
                    {getDisplayNameForAddress(
                      userAddress,
                      bet.teamABetter,
                      myDisplayName,
                      serverProfiles
                    )}{" "}
                    (side A)
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Same OKB amount as side A"
                value={joinAmount}
                onChange={(e) => setJoinAmount(e.target.value)}
                disabled={loading}
                min="0"
                step="0.01"
              />
              <button
                type="button"
                onClick={handleJoinBet}
                disabled={loading || !selectedBetId}
              >
                {loading ? "Joining…" : "Join stake"}
              </button>
            </div>
            {openBetsOnMatch.length === 0 && (
              <p className="text-muted">
                No open stakes for this match yet. Create one above.
              </p>
            )}
          </div>

          <div className="sub-block">
            <h3>Active stakes for this match</h3>
            {betsForSelectedMatch.length === 0 ? (
              <p className="text-muted">No on-chain rows for this title yet.</p>
            ) : (
              <div className="bets-list">
                {betsForSelectedMatch.map((bet) => (
                  <div key={bet.betId} className="bet-card">
                    <h3>Stake #{bet.betId.toString()}</h3>
                    <div className="bet-details">
                      <p>
                        <strong>Amount (each side):</strong>{" "}
                        {formatOkb(bet.amount)}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {BET_STATUS[Number(bet.status)] ?? "UNKNOWN"}
                      </p>
                      {!addrEq(bet.teamBBetter, ZERO) && (
                        <p>
                          <strong>Outcome:</strong>{" "}
                          {OUTCOMES[Number(bet.outcome)] ?? "UNKNOWN"}
                        </p>
                      )}
                      <p>
                        <strong>Side A:</strong>{" "}
                        {getDisplayNameForAddress(
                          userAddress,
                          bet.teamABetter,
                          myDisplayName,
                          serverProfiles
                        )}
                      </p>
                      <p>
                        <strong>Side B:</strong>{" "}
                        {addrEq(bet.teamBBetter, ZERO)
                          ? "Waiting for opponent"
                          : getDisplayNameForAddress(
                              userAddress,
                              bet.teamBBetter,
                              myDisplayName,
                              serverProfiles
                            )}
                      </p>
                    </div>

                    <div className="bet-actions">
                      {bet.status === 0 &&
                        addrEq(bet.teamABetter, userAddress) && (
                          <button
                            type="button"
                            onClick={() => handleCancelBet(bet.betId)}
                            disabled={loading}
                          >
                            Cancel open stake
                          </button>
                        )}
                      {bet.status === 1 && isContractAdmin && (
                        <div className="resolve-buttons">
                          <button
                            type="button"
                            className="btn-admin"
                            onClick={() => handleResolveBet(bet.betId, 1)}
                            disabled={loading}
                          >
                            Team A wins
                          </button>
                          <button
                            type="button"
                            className="btn-admin"
                            onClick={() => handleResolveBet(bet.betId, 2)}
                            disabled={loading}
                          >
                            Team B wins
                          </button>
                          <button
                            type="button"
                            className="btn-admin"
                            onClick={() => handleResolveBet(bet.betId, 3)}
                            disabled={loading}
                          >
                            Draw
                          </button>
                        </div>
                      )}
                      {bet.status === 1 && !isContractAdmin && (
                        <p className="text-muted">
                          Waiting for contract admin to settle this stake.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {selectedMatch && (!walletConnected || !isContractReady) && (
        <section className="section match-panel muted-panel">
          <h2>{selectedMatch.name}</h2>
          <p className="section-note">
            {!walletConnected
              ? "Connect your wallet to create or join stakes for this match."
              : contractLoadError ||
                "Deploy MatchStake on X Layer to enable on-chain stakes."}
          </p>
        </section>
      )}

      {message && (
        <div
          className={`message ${
            (() => {
              const x = message.toLowerCase();
              return (
                x.includes("success") ||
                x.includes("saved") ||
                x.includes("good luck") ||
                x.includes("welcome") ||
                x.includes("waiting for") ||
                x.includes("joined the stake") ||
                x.includes("refunded") ||
                x.includes("resolved.")
              );
            })()
              ? "success"
              : "error"
          }`}
        >
          {message}
        </div>
      )}

      <footer className="footer">
        <p>
          MatchStake hackathon demo · X Layer · Profile API on port 3001
        </p>
      </footer>
    </div>
  );
}

export default App;
