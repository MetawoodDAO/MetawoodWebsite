import {Address, Web3FailureReason} from "../ethereum/Web3Types";
import {createSlice} from "@reduxjs/toolkit";

interface Connected {
    connected: true;
    address: Address;
}

interface NotConnected {
    connected: false;
    reason: Web3FailureReason;
}

type DataStructure = { state: Connected | NotConnected; }

const initialState: DataStructure = {state: { connected: false, reason: {reason: "NOT_CONNECTED"} }};

const Web3Slice = createSlice({
    name: "Web3",
    initialState,
    reducers: {
        updateWeb3State: (state, action) => {
            const {payload} = action;
            state.state = payload;
        }
    }
});

export const { updateWeb3State } = Web3Slice.actions;
export const Web3Reducer = Web3Slice.reducer;
