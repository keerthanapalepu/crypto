import React, { useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  makeStyles,
  Backdrop,
  Grid,
  Container,
  Typography,
} from '@material-ui/core';
import { Check, Close } from '@material-ui/icons'
import { Alchemy, Network, Wallet, Utils } from 'alchemy-sdk';
const useStyles = makeStyles((theme) => ({
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    color: "white"
  },
  formContainer: {
    margin: "auto",
    paddingTop: "12rem"
  },
  textField: {
    marginBottom: theme.spacing(2),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Set the opacity here
  },
}));
const settings = {
  apiKey: 'lU8oNjHkOv-rmLCPN0FCZc9i4maJyZiO',
  network: Network.ETH_SEPOLIA,
};

const alchemy = new Alchemy(settings);

const wallet = new Wallet('ff10171daee77fd45bd30c665eed74a9f11daeecacc5f4a42eeb7de67c73253e');

const App = () => {
  console.log(process.env.REACT_APP_PRIVATE_KEY, process.env.REACT_APP_API_KEY)
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactionAddress, setTransactionAddress] = useState('');
  const [Amount, setAmount] = useState('');
  const [response, setResponse] = useState('');
  const [hash, setHash] = useState('');
  const handleDialogOpen = () => {
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
  };

  const LoadingScreen = () => {
    return (
      <Backdrop open={true} className={classes.backdrop}>
        <CircularProgress className={classes.loading} />
      </Backdrop>
    );
  };
 
  async function sendTransaction() {
    setLoading(true);
    try {
      const nonce = await alchemy.core.getTransactionCount(
        wallet.address,
        'latest'
      );
  
      const transaction = {
        to: transactionAddress,
        value: Utils.parseEther(Amount),
        gasLimit: '21000',
        maxPriorityFeePerGas: Utils.parseUnits('5', 'gwei'),
        maxFeePerGas: Utils.parseUnits('20', 'gwei'),
        nonce: nonce,
        type: 2,
        chainId: 11155111,
      };
  
      const rawTransaction = await wallet.signTransaction(transaction);
      alchemy.core.sendTransaction(rawTransaction).then((tx) => {
        console.log('Sent transaction', tx.hash);
        setHash(tx.hash)
        setTimeout(() => {
          alchemy.core.getTransactionReceipt(tx.hash).then((tx) => {
            if (!tx) {
              console.log("Pending or Unknown Transaction");
              setResponse("Pending or Unknown Transaction")
            } else if (tx.status === 1) {
              console.log("Transaction was successful!");
              setResponse("Transaction was successful!")
            } else {
              console.log("Transaction failed!");
              setResponse("Transaction failed!")
            }
            setLoading(false);
            setOpen(true);
            
          });
        }, 8000); 
      
      
      })
    } catch (error) {
      console.error('Error sending transaction:', error);
      setLoading(false);
    }
  }
  const checkAgain = () => {
    setLoading(true);
    setOpen(false);
    setTimeout(() => {
      alchemy.core.getTransactionReceipt(hash).then((tx) => {
        if (!tx) {
          console.log("Pending or Unknown Transaction");
          setResponse("Pending or Unknown Transaction")
        } else if (tx.status === 1) {
          console.log("Transaction was successful!");
          setResponse("Transaction was successful!")
        } else {
          console.log("Transaction failed!");
          setResponse("Transaction failed!")
        }
        setLoading(false);
        setOpen(true);
        
      });
    }, 2000); 
  
  }
 
  return (
    <div>
      <Container maxWidth="sm" className={classes.formContainer}>
      <Typography variant='h4' align='center' style={{
        paddingBottom: "2rem",
        fontWeight: "bolder"
      }}>Send Ethereum to anyone</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Transaction Address"
              name= "Address"
              value={transactionAddress}
              onChange={(e) => setTransactionAddress(e.target.value)}
              className={classes.textField}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Amount"
              value={Amount}
              name= "amount"
              onChange={(e) => setAmount(e.target.value)}
              className={classes.textField}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit" variant="contained" style={{ backgroundColor: '#B00020', color: 'white' }}
              fullWidth
              onClick={(e)=>{ e.preventDefault(); sendTransaction();}}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
    </Container>
      {loading && (
            <LoadingScreen />
        )}
      <Dialog open={open} onClose={handleDialogClose}>
      <DialogTitle>Response</DialogTitle>
            <DialogContent>
              <Typography variant='h6' align='center'> {response === "Transaction was successful!"? (
                <div style={{display: "flex", alignItems: "center"}}>
                  <Check style={{color: "green", fontSize: "35px", paddingRight: "15px"}}/>
                  {response}
                </div>
              ):
              (<div style={{display: "flex", alignItems: "center"}}>
                <Close style={{color: "red", fontSize: "35px", paddingRight: "15px"}}/>
                {response}
              </div>)}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose} color="primary">
                Close
              </Button>
              {response === "Transaction was successful!" && (<Button onClick={() => {
                window.open("https://sepolia.etherscan.io/address/0xd94fed42719db4e9ac48a587ad25bd14fc19b697", "_blank")
              }} color="primary">
                Check Transactions
              </Button>)}
              {response === "Pending or Unknown Transaction" && (<Button onClick={() => {
                checkAgain();
              }} color="primary">
                Try Again
              </Button>)}
            </DialogActions>
        
      </Dialog>
    </div>
  );
};

export default App;