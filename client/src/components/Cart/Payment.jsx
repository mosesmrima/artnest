import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PriceSidebar from "./PriceSidebar";
import Stepper from "./Stepper";
import { clearErrors } from "../../actions/orderAction";
import { useSnackbar } from "notistack";
import { post } from "../../utils/paytmForm";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import MetaData from "../Layouts/MetaData";

// Import ethers.js for Ethereum-based tokens like USDC and DAI
import { ethers } from "ethers";

const Payment = () => {
	const dispatch = useDispatch();
	const { enqueueSnackbar } = useSnackbar();

	const [payDisable, setPayDisable] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState("paytm");
	const { shippingInfo, cartItems } = useSelector((state) => state.cart);
	const { user } = useSelector((state) => state.user);
	const { error } = useSelector((state) => state.newOrder);

	const totalPrice = cartItems.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);

	const paymentData = {
		amount: Math.round(totalPrice),
		email: user.email,
		phoneNo: shippingInfo.phoneNo,
	};

	const handleCryptoPayment = async () => {
		try {
			setPayDisable(true);

			if (paymentMethod === "usdc" || paymentMethod === "dai") {
			
				const provider = new ethers.providers.Web3Provider(window.ethereum);
				const signer = provider.getSigner();
				const tokenAddress =
					paymentMethod === "usdc"
						? "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
						: "0x6b175474e89094c44da98b954eedeac495271d0f";
				const amountInWei = ethers.utils.parseUnits(totalPrice.toString(), 18);

				const tokenContract = new ethers.Contract(
					tokenAddress,
					["function transfer(address to, uint amount) public returns (bool)"],
					signer
				);

				await tokenContract.transfer(
					"0xf60e7Aa3573db940A7522ad95CDD7AE068Fdf11F",
					amountInWei
				);
				enqueueSnackbar("Payment successful!", { variant: "success" });
			} else if (paymentMethod === "sol") {
				
				const solana = window.solana;
				if (solana && solana.isPhantom) {
					const solAmount = totalPrice / 100;
					await solana.connect();

					const transaction = {
						to: "<RECIPIENT_SOLANA_ADDRESS>",
						value: solAmount * 1e9, // Convert to lamports
					};

					await solana.request({
						method: "transfer",
						params: [transaction],
					});

					enqueueSnackbar("Payment successful!", { variant: "success" });
				} else {
					enqueueSnackbar("Phantom wallet not detected.", { variant: "error" });
				}
			}
		} catch (error) {
			setPayDisable(false);
			enqueueSnackbar("Payment failed. Please try again.", {
				variant: "error",
			});
		} finally {
			setPayDisable(false);
		}
	};

	const submitHandler = async (e) => {
		e.preventDefault();

		if (paymentMethod === "paytm") {
			setPayDisable(true);
			try {
				const config = {
					headers: {
						"Content-Type": "application/json",
					},
				};

				const { data } = await axios.post(
					"/api/v1/payment/process",
					paymentData,
					config
				);

				let info = {
					action: "https://securegw-stage.paytm.in/order/process",
					params: data.paytmParams,
				};

				post(info);
			} catch (error) {
				setPayDisable(false);
				enqueueSnackbar(error, { variant: "error" });
			}
		} else {
			await handleCryptoPayment();
		}
	};

	useEffect(() => {
		if (error) {
			dispatch(clearErrors());
			enqueueSnackbar(error, { variant: "error" });
		}
	}, [dispatch, error, enqueueSnackbar]);

	return (
		<>
			<MetaData title="WonderEmkart: Secure Payment | Paytm & Crypto" />

			<main className="w-full mt-20">
				<div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-11/12 mt-0 sm:mt-4 m-auto sm:mb-7">
					<div className="flex-1">
						<Stepper activeStep={3}>
							<div className="w-full bg-white">
								<form
									onSubmit={(e) => submitHandler(e)}
									autoComplete="off"
									className="flex flex-col justify-start gap-2 w-full mx-8 my-4 overflow-hidden"
								>
									<FormControl>
										<RadioGroup
											aria-labelledby="payment-radio-group"
											value={paymentMethod}
											onChange={(e) => setPaymentMethod(e.target.value)}
											name="payment-radio-button"
										>
											<FormControlLabel
												value="paytm"
												control={<Radio />}
												label={
													<div className="flex items-center gap-4">
														<img
															draggable="false"
															className="h-6 w-6 object-contain"
															src="https://rukminim1.flixcart.com/www/96/96/promos/01/09/2020/a07396d4-0543-4b19-8406-b9fcbf5fd735.png"
															alt="Paytm Logo"
														/>
														<span>Paytm</span>
													</div>
												}
											/>
											<FormControlLabel
												value="usdc"
												control={<Radio />}
												label="Pay with USDC"
											/>
											<FormControlLabel
												value="dai"
												control={<Radio />}
												label="Pay with DAI"
											/>
											<FormControlLabel
												value="sol"
												control={<Radio />}
												label="Pay with SOL"
											/>
										</RadioGroup>
									</FormControl>

									<input
										type="submit"
										value={`Pay ${
											paymentMethod === "paytm" ? "₹" : ""
										}${totalPrice.toLocaleString()}`}
										disabled={payDisable ? true : false}
										className={`${
											payDisable
												? "bg-primary-grey cursor-not-allowed"
												: "bg-primary-orange cursor-pointer"
										} w-1/2 sm:w-1/4 my-2 py-3 font-medium text-white shadow hover:shadow-lg rounded-sm uppercase outline-none`}
									/>
								</form>
							</div>
						</Stepper>
					</div>

					<PriceSidebar cartItems={cartItems} />
				</div>
			</main>
		</>
	);
};

export default Payment;
