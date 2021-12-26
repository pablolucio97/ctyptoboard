import { GetStaticProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import React, { FormEvent, useEffect, useState } from "react";
import { ImCoinDollar } from "react-icons/im";
import Modal from "react-modal";

import { Flex, HStack, Select, Text, useToast, VStack } from "@chakra-ui/react";

import { PrimaryButton } from "../components/PrimaryButton";
import { SecondaryButton } from "../components/SecondaryButton";
import { SubTitle } from "../components/SubTitle";
import { Title } from "../components/Title";
import { WalletComponent } from "../components/Wallet";
import { WalletCoin } from "../components/WalletCoin";
import { api } from "../services/api";
import styles from "../styles/modalStyles.module.scss";
import { WalletCoins } from "../types/generalTypes";
import { formatDate } from "../utils/formats";

const Chart = dynamic(() => import('react-apexcharts'), {
    ssr: false
})

export default function Wallet({ returnedCoins }) {

    const toast = useToast()

    const [openBuyCoinModal, setOpenBuyCoinModal] = useState(false)
    const [selectedCoin, setSelectedCoin] = useState('')
    const [selectedCoinImgUrl, setSelectedCoinImgUrl] = useState('')
    const [selectedCoinCurrentValue, setSelectedCoinCurrentValue] = useState(0)
    const [coins, setCoins] = useState(returnedCoins)
    const [valueToInvest, setValueToInvest] = useState(0)
    const [coinQuanityPreview, setCoinQuanityPreview] = useState(0)
    const [walletCoins, setWalletCoins] = useState<WalletCoins[]>([])

    function openModal() {
        setOpenBuyCoinModal(true)
    }
    function closeModal() {
        setOpenBuyCoinModal(false)
    }

    function calcPreviewCoinQuantity(coinSymbol) {
        if (coinSymbol === '') {
            return
        }
        const currentValue = coins.filter(coin => coin.symbol === coinSymbol)[0].price
        const coinIconURL = coins.filter(coin => coin.symbol === coinSymbol)[0].iconUrl
        const formatCurrentValue = Number(currentValue)

        const coinsPreview = formatCurrentValue > 0 ?
            Number(Number(valueToInvest / currentValue).toFixed(4))
            :
            Number(Number(valueToInvest / currentValue).toFixed(6))

        setSelectedCoinCurrentValue(currentValue)
        setSelectedCoinImgUrl(coinIconURL)
        setCoinQuanityPreview(coinsPreview)
    }

    useEffect(() => {
        calcPreviewCoinQuantity(selectedCoin)
    }, [valueToInvest])

    async function fetchWallet() {
        const data = await api.get('/wallet')
        const { cryptos } = data.data.data
        if (cryptos) setWalletCoins(cryptos)
    }


    async function buyCrypto(e: FormEvent) {
        e.preventDefault()
        const newCrypto = {
            id: String(Number(Math.random() * 1000).toFixed(0)),
            symbol: selectedCoin,
            iconUrl: selectedCoinImgUrl,
            quantity: coinQuanityPreview,
            valueInBuyDate: selectedCoinCurrentValue,
            buyDate: formatDate(),
            investedValue: valueToInvest,
        }

        await api.post('/wallet', newCrypto).then(() => closeModal())
        toast({
            title: 'Compra de moeda',
            description: "Compra realizada com sucesso.",
            position: 'top',
            duration: 3000,
            isClosable: true
        })
    }

    useEffect(() => {
        fetchWallet()
    }, [buyCrypto])

    function getUpdatedCoinValue(coinInWallet: string) {
        const updatedCoinValue = coins.filter(coin => coin.symbol === coinInWallet)
        return updatedCoinValue[0].price
    }


    const coinsValue = [44, 15, 13, 33]
    const coinsName = ['Bitcoin', 'Ethereum', 'The Graph', 'Decentraland']


    var options = {
        labels: coinsName,
        series: coinsValue,
        chart: {
            width: 320,
            type: 'donut',
        },
        dataLabels: {
            enabled: false
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    show: false
                }
            }
        }],
        legend: {
            position: 'right',
            offsetY: 0,
            height: 230,
        }
    };


    return (
        <>
            <Head>
                <title>CryptoBoard | Carteira</title>
            </Head>
            <Flex
                display="flex"
                flexDirection='column'
                width="90vw"
                margin='0 auto 2rem'
                justifyContent='flex-start'
                alignItems='center'
                padding='0 4rem'
            >
                <VStack
                    display="flex"
                    flexDirection='column'
                    alignItems='flex-start'
                    mb='1rem'
                >
                    <Title
                        content="Carteira"
                    />
                    <SubTitle
                        content="Minhas criptomoedas"
                    />
                    <WalletComponent>
                        {walletCoins.map(coin => (
                            <WalletCoin
                                id={coin.id}
                                iconUrl={coin.iconUrl}
                                symbol={coin.symbol}
                                quantity={coin.quantity}
                                buyDate={coin.buyDate}
                                valueInBuyDate={coin.valueInBuyDate}
                                investedValue={coin.investedValue}
                                updatedValue={getUpdatedCoinValue(coin.symbol)}
                                updatedInvestedValue={coin.updatedInvestedValue}
                            />
                        ))}
                    </WalletComponent>
                    <PrimaryButton
                        label="Adicionar moeda"
                        action={openModal}
                        size="md"
                        disabled={false}
                        type="button"
                    />
                    <Title
                        content="Resumo"
                    />
                    <SubTitle
                        content="Informações resumidas da carteira"
                    />
                    <VStack
                        display="flex"
                        flex-direction="column"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        width="1200px"
                        backgroundColor='white'
                        padding='1rem'
                    >
                        <Text
                            marginBottom='4px'
                            fontWeight='500'
                        >
                            Total investido: $3.657,00
                        </Text>
                        <Text
                            fontWeight='500'
                        >
                            Total de ativos: 4
                        </Text>
                        <Text
                            fontWeight='500'
                        >
                            Valor do lucro total: $23.657,88
                        </Text>
                        <Chart
                            type='donut'
                            //@ts-ignore
                            options={options}
                            height="300px"
                            series={options.series}
                        />
                    </VStack>
                </VStack>
                <Modal
                    isOpen={openBuyCoinModal}
                    onRequestClose={closeModal}
                    className={styles.activemodal}
                    overlayClassName={styles.reactModalOverlay}
                >
                    <strong>Adicionar moeda</strong>
                    <form onSubmit={buyCrypto}>
                        <Text>Moeda</Text>
                        <Select
                            onChange={(e) => { setSelectedCoin(e.target.value), calcPreviewCoinQuantity(e.target.value) }}
                        >
                            {coins.map(coin => (
                                <option key={coin.id} value={coin.symbol}>{coin.symbol}</option>
                            ))}
                        </Select>
                        <HStack
                            display="flex"
                            width='48px'
                            alignItems="center"
                            padding='1rem'
                        >
                        </HStack>
                        <img
                            src={selectedCoinImgUrl}
                            width="24" height="24"
                          
                        />
                        <Text>Valor de compra (USD)</Text>
                        <input type="number"
                            min={0}
                            max={1000}
                            required
                            maxLength={10}
                            value={valueToInvest}
                            onChange={(e) => { setValueToInvest(e.target.valueAsNumber) }}
                        />
                        {valueToInvest > 0 &&
                            <Text>Previsão: {coinQuanityPreview} {selectedCoin}'s.</Text>
                        }
                        <HStack
                            mt='1rem'
                        >
                            <PrimaryButton
                                label='Confirmar'
                                action={() => buyCrypto}
                                type='submit'
                            />
                            <SecondaryButton
                                label='Cancelar'
                                action={closeModal}
                            />
                        </HStack>
                    </form>

                </Modal>
            </Flex>
        </>
    )
}

export const getStaticProps: GetStaticProps = async () => {

    const headers = {
        'x-rapidapi-host': 'coinranking1.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPID_API_KEY,
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }

    const response = await fetch('https://coinranking1.p.rapidapi.com/coins', {
        headers
    })

    const { data } = await response.json()
    const coins = data.coins

    const returnedCoins = coins.map(coin => {
        return {
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            iconUrl: coin.iconUrl,
            price: coin.price
        }
    })
    return {
        props: {
            returnedCoins
        }
    }
}
