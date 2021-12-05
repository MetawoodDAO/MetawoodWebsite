import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Address, Web3FailureReason} from "../ethereum/Web3Types";

interface Connected {
    connected: true;
    address: Address;
}

interface NotConnected {
    connected: false;
    reason: Web3FailureReason;
    message?: string;
}

type DataStructure = {state: Connected | NotConnected};

const initialState: DataStructure = {state: {connected: false, reason: {reason: "NOT_INSTALLED"}}};

const Web3Slice = createSlice({
    name: "Web3",
    initialState,
    reducers: {
        updateWeb3State: (state, action: PayloadAction<Connected|NotConnected>) => {
            const {payload} = action;
            state.state = payload;
        }
    }
});

export const { updateWeb3State } = Web3Slice.actions;
export const Web3Reducer = Web3Slice.reducer;
