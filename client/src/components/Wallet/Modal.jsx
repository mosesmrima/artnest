import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";


const WalletModal = ({
	open,
	handleClose,
	connectMetaMask,
	connectPhantom,
}) => {
	return (
		<Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
			<DialogTitle className="text-center font-medium">
				Connect Wallet
			</DialogTitle>
			<DialogContent>
				<div className="flex flex-col gap-4 p-4">
					<button
						onClick={connectMetaMask}
						className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
					>
						<img src="/metamask-logo.svg" alt="MetaMask" className="w-8 h-8" />
						<span>MetaMask</span>
					</button>
					<button
						onClick={connectPhantom}
						className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
					>
						<img src="/phantom-logo.svg" alt="Phantom" className="w-8 h-8" />
						<span>Phantom</span>
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

const ConnectWalletButton = ({ isAuthenticated }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [connectedWallet, setConnectedWallet] = useState(null);

	const connectMetaMask = async () => {
		if (typeof window.ethereum !== "undefined") {
			try {
				const accounts = await window.ethereum.request({
					method: "eth_requestAccounts",
				});
				setConnectedWallet({
					type: "MetaMask",
					address: accounts[0],
				});
				setIsModalOpen(false);
			} catch (error) {
				console.error("MetaMask connection error:", error);
			}
		} else {
			window.open("https://metamask.io/download/", "_blank");
		}
	};

	const connectPhantom = async () => {
		if (typeof window.solana !== "undefined") {
			try {
				const response = await window.solana.connect();
				setConnectedWallet({
					type: "Phantom",
					address: response.publicKey.toString(),
				});
				setIsModalOpen(false);
			} catch (error) {
				console.error("Phantom connection error:", error);
			}
		} else {
			window.open("https://phantom.app/", "_blank");
		}
	};

	if (!isAuthenticated) {
		return null;
	}

	return (
		<>
			<Button
            color="info"
            variant="contained"
				onClick={() => setIsModalOpen(true)}
				className="flex items-center gap-2 px-4 py-2 text-white"
				startIcon={<AccountBalanceWalletIcon />}
			>
				{connectedWallet
					? `${connectedWallet.type} Connected`
					: "Connect Wallet"}
			</Button>

			<WalletModal
				open={isModalOpen}
				handleClose={() => setIsModalOpen(false)}
				connectMetaMask={connectMetaMask}
				connectPhantom={connectPhantom}
			/>
		</>
	);
};

export default ConnectWalletButton;
